import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.incident import Incident
from app.models.alert import Alert
from app.models.asset import Asset
from app.models.audit import AuditLog
from app.schemas.all_schemas import (
    IncidentResponse, IncidentDetailResponse, IncidentActionRequest, BLUFResponse
)
from app.services.scoring import calculate_incident_risk
from app.services.correlation import generate_correlation_explanations, extract_mitre_mappings
from app.ai import get_ai_provider

router = APIRouter()

def format_incident_response(inc: Incident) -> dict:
    """Helper to parse JSON fields safely for response model."""
    score_bd = json.loads(inc.score_breakdown) if inc.score_breakdown else None
    corr_expl = json.loads(inc.correlation_explanation) if inc.correlation_explanation else None
    mitre_maps = json.loads(inc.mitre_mappings) if inc.mitre_mappings else None
    
    return {
        "id": inc.id,
        "title": inc.title,
        "status": inc.status,
        "priority": inc.priority,
        "risk_score": inc.risk_score,
        "confidence": inc.confidence,
        "campaign_id": inc.campaign_id,
        "assigned_analyst": inc.assigned_analyst,
        "first_seen": inc.first_seen,
        "last_seen": inc.last_seen,
        "affected_assets_count": inc.affected_assets_count,
        "alerts_count": inc.alerts_count,
        "score_breakdown": score_bd,
        "correlation_explanation": corr_expl,
        "mitre_mappings": mitre_maps,
        "bluf_summary": inc.bluf_summary,
        "is_synthetic": inc.is_synthetic
    }

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    campaign_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List correlated security incidents with filtering."""
    query = db.query(Incident)
    
    if priority:
        query = query.filter(Incident.priority.ilike(priority))
    if status:
        query = query.filter(Incident.status.ilike(status))
    if campaign_id:
        query = query.filter(Incident.campaign_id == campaign_id)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Incident.id.ilike(s),
                Incident.title.ilike(s),
                Incident.assigned_analyst.ilike(s)
            )
        )
        
    incidents = query.order_by(Incident.risk_score.desc()).all()
    return [format_incident_response(inc) for inc in incidents]

@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    """Retrieve complete dossier for an incident including alerts, timeline, evidence, and BLUF."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    alerts = db.query(Alert).filter(Alert.incident_id == inc.id).order_by(Alert.timestamp.asc()).all()
    notes = json.loads(inc.investigation_notes) if inc.investigation_notes else []
    
    resp_dict = format_incident_response(inc)
    resp_dict["alerts"] = alerts
    resp_dict["investigation_notes"] = notes
    resp_dict["false_positive_reason"] = inc.false_positive_reason
    return resp_dict

@router.post("/{incident_id}/bluf", response_model=BLUFResponse)
def generate_bluf_briefing(incident_id: str, db: Session = Depends(get_db)):
    """Generate or refresh structured military BLUF briefing via AI Provider (watsonx or Demo fallback)."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    alerts = db.query(Alert).filter(Alert.incident_id == inc.id).order_by(Alert.timestamp.asc()).all()
    asset_ids = list({a.asset_id for a in alerts if a.asset_id})
    assets = db.query(Asset).filter(Asset.id.in_(asset_ids)).all() if asset_ids else []
    
    ai_provider = get_ai_provider()
    bluf_resp = ai_provider.generate_bluf(inc, alerts, assets)
    
    # Store updated BLUF text in incident
    inc.bluf_summary = (
        f"BOTTOM LINE UP FRONT (BLUF):\n{bluf_resp.bottom_line}\n\n"
        f"WHAT HAPPENED:\n{bluf_resp.what_happened}\n\n"
        f"WHY IT MATTERS:\n{bluf_resp.why_it_matters}\n\n"
        f"RECOMMENDED IMMEDIATE ACTIONS:\n" + "\n".join(f"- {act}" for act in bluf_resp.recommended_actions)
    )
    
    db.add(AuditLog(
        timestamp=datetime.utcnow(),
        user="analyst_lead",
        action="GENERATE_BLUF",
        target_type="INCIDENT",
        target_id=inc.id,
        details=f"Generated BLUF briefing via {bluf_resp.ai_provider}."
    ))
    db.commit()
    
    return bluf_resp

@router.post("/{incident_id}/score")
def recalculate_score(incident_id: str, db: Session = Depends(get_db)):
    """Recalculate explainable 0-100 risk score and update incident record."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    alerts = db.query(Alert).filter(Alert.incident_id == inc.id).all()
    score_result = calculate_incident_risk(alerts, db)
    
    inc.risk_score = score_result["total"]
    inc.priority = score_result["priority"]
    inc.score_breakdown = json.dumps(score_result)
    db.commit()
    
    return {"message": "Score recalculated successfully", "score_breakdown": score_result}

@router.post("/{incident_id}/correlate")
def re_correlate_incident(incident_id: str, db: Session = Depends(get_db)):
    """Re-evaluate correlation evidence and MITRE techniques for this incident."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    alerts = db.query(Alert).filter(Alert.incident_id == inc.id).all()
    explanations = generate_correlation_explanations(alerts, db)
    mitre_maps = extract_mitre_mappings(alerts, db)
    
    inc.correlation_explanation = json.dumps(explanations)
    inc.mitre_mappings = json.dumps(mitre_maps)
    db.commit()
    
    return {
        "message": "Correlation updated",
        "correlation_explanation": explanations,
        "mitre_mappings": mitre_maps
    }

@router.post("/{incident_id}/action")
def perform_analyst_action(incident_id: str, req: IncidentActionRequest, db: Session = Depends(get_db)):
    """
    Execute analyst workflow action:
    - confirm: Mark threat as verified active incident
    - false_positive: Suppress as false positive with documented reason
    - escalate: Route to commander priority review
    - dismiss: Close out benign incident
    - assign: Reassign incident owner
    - add_note: Append timestamped investigation note
    """
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    action_type = req.action.lower()
    user = "analyst_lead"
    
    if action_type == "confirm":
        inc.status = "CONFIRMED"
        log_action = "CONFIRM_THREAT"
        details = "Analyst confirmed genuine hostile cyber threat."
    elif action_type == "false_positive":
        inc.status = "FALSE_POSITIVE"
        inc.false_positive_reason = req.reason or "Classified as benign or authorized maintenance activity."
        inc.priority = "LOW"
        inc.risk_score = min(25.0, inc.risk_score * 0.3) # Suppress risk score
        log_action = "MARK_FALSE_POSITIVE"
        details = f"Marked false positive: {inc.false_positive_reason}"
    elif action_type == "escalate":
        inc.status = "ESCALATED"
        inc.priority = "CRITICAL"
        log_action = "ESCALATE"
        details = "Escalated to Watch Commander."
    elif action_type == "dismiss":
        inc.status = "DISMISSED"
        log_action = "DISMISS"
        details = "Dismissed from active threat queue."
    elif action_type == "assign":
        if req.analyst:
            inc.assigned_analyst = req.analyst
        log_action = "ASSIGN"
        details = f"Assigned to {inc.assigned_analyst}"
    elif action_type == "add_note":
        if req.note:
            notes = json.loads(inc.investigation_notes) if inc.investigation_notes else []
            notes.append({
                "timestamp": datetime.utcnow().isoformat(),
                "analyst": req.analyst or "Analyst",
                "note": req.note
            })
            inc.investigation_notes = json.dumps(notes)
        log_action = "ADD_NOTE"
        details = f"Appended note: {req.note}"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {req.action}")

    db.add(AuditLog(
        timestamp=datetime.utcnow(),
        user=user,
        action=log_action,
        target_type="INCIDENT",
        target_id=inc.id,
        details=details
    ))
    db.commit()
    
    return {
        "status": "success",
        "action": action_type,
        "incident_id": inc.id,
        "new_status": inc.status,
        "new_priority": inc.priority
    }
