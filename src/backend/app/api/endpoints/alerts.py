from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.alert import Alert
from app.schemas.all_schemas import AlertResponse, AlertCreate, IngestionStats
from app.services.ingestion import process_alert_records, parse_csv_bytes, parse_json_bytes

router = APIRouter()

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    severity: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    asset_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """Retrieve normalized threat alerts with multi-attribute filtering."""
    query = db.query(Alert)
    
    if severity:
        query = query.filter(Alert.severity.ilike(severity))
    if source:
        query = query.filter(Alert.source.ilike(source))
    if asset_id:
        query = query.filter(Alert.asset_id == asset_id)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Alert.id.ilike(s),
                Alert.description.ilike(s),
                Alert.event_type.ilike(s),
                Alert.hostname.ilike(s),
                Alert.src_ip.ilike(s),
                Alert.user.ilike(s)
            )
        )
        
    alerts = query.order_by(Alert.timestamp.desc()).offset(offset).limit(limit).all()
    return alerts

@router.post("", response_model=AlertResponse)
def create_manual_alert(alert_in: AlertCreate, db: Session = Depends(get_db)):
    """Manually inject and normalize a single alert."""
    stats, alerts = process_alert_records([alert_in.model_dump()], db)
    if not alerts:
        raise HTTPException(status_code=400, detail="Alert could not be ingested or was a duplicate.")
    return alerts[0]

@router.post("/upload", response_model=IngestionStats)
async def upload_alerts_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Ingest multi-source threat feed files (CSV or JSON).
    Performs format validation, field normalisation, deduplication, and database persistence.
    """
    filename = file.filename.lower()
    content = await file.read()
    
    if filename.endswith(".csv"):
        stats, _ = parse_csv_bytes(content, db)
        return stats
    elif filename.endswith(".json") or filename.endswith(".jsonl"):
        stats, _ = parse_json_bytes(content, db)
        return stats
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV or JSON.")

@router.get("/sources", response_model=List[str])
def get_alert_sources():
    """Return list of supported multi-source feeds."""
    return ["SIEM", "Firewall", "IDS", "Endpoint", "Intelligence Report", "Satellite Feed", "Network Sensor"]
