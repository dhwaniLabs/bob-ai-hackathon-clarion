from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db, Base, engine
from app.services.demo_generator import generate_demo_attack_chain
from app.services.correlation import correlate_unassigned_alerts
from app.database.seed_data import seed_database
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.campaign import Campaign
from app.models.report import Report
from app.models.audit import AuditLog

router = APIRouter()

@router.post("/generate")
def trigger_demo_attack(db: Session = Depends(get_db)):
    """
    Generate realistic synthetic attack chain 'Operation Nightfall'.
    Ingests 10-14 multi-stage alerts, correlates into campaign, scores risk 94/100,
    maps MITRE techniques, and drafts AI BLUF briefing.
    """
    return generate_demo_attack_chain(db)

@router.post("/correlate-now")
def run_correlation_cycle(db: Session = Depends(get_db)):
    """Manually trigger the explainable correlation engine over all unassigned alerts."""
    new_incidents = correlate_unassigned_alerts(db)
    return {
        "status": "success",
        "incidents_created": len(new_incidents),
        "incident_ids": [i.id for i in new_incidents]
    }

@router.post("/reset")
def reset_demo_database(db: Session = Depends(get_db)):
    """Reset database and re-seed baseline environment for repeatable live demonstrations."""
    # Delete dependent operational tables
    db.query(Alert).delete()
    db.query(Incident).delete()
    db.query(Campaign).delete()
    db.query(Report).delete()
    db.query(AuditLog).delete()
    db.commit()

    # Re-seed
    seed_database(db)
    
    return {
        "status": "success",
        "message": "Database successfully reset to initial baseline demonstration state."
    }
