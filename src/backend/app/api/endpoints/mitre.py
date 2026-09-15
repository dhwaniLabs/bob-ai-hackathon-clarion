from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.mitre import MitreTechnique
from app.models.alert import Alert
from app.schemas.all_schemas import MitreTechniqueResponse

router = APIRouter()

@router.get("", response_model=List[MitreTechniqueResponse])
def list_mitre_techniques(db: Session = Depends(get_db)):
    """Retrieve all MITRE ATT&CK techniques with observed alert hit counts."""
    techniques = db.query(MitreTechnique).all()
    
    # Calculate observed counts across alerts
    obs_counts = db.query(Alert.mitre_technique_id, func.count(Alert.id)).group_by(Alert.mitre_technique_id).all()
    count_map = {t: c for t, c in obs_counts if t}
    
    results = []
    for t in techniques:
        results.append(MitreTechniqueResponse(
            id=t.id,
            tactic=t.tactic,
            name=t.name,
            subtechnique_of=t.subtechnique_of,
            description=t.description,
            detection_guidance=t.detection_guidance,
            severity_hint=t.severity_hint,
            observed_count=count_map.get(t.id, 0)
        ))
    return results

@router.get("/matrix")
def get_mitre_matrix(db: Session = Depends(get_db)):
    """Return MITRE ATT&CK enterprise matrix grouped by tactics."""
    techniques = db.query(MitreTechnique).all()
    obs_counts = db.query(Alert.mitre_technique_id, func.count(Alert.id)).group_by(Alert.mitre_technique_id).all()
    count_map = {t: c for t, c in obs_counts if t}
    
    tactics_order = [
        "Reconnaissance", "Initial Access", "Execution", "Persistence",
        "Privilege Escalation", "Defense Evasion", "Credential Access",
        "Discovery", "Lateral Movement", "Collection", "Command and Control",
        "Exfiltration", "Impact"
    ]
    
    matrix = {}
    for tactic in tactics_order:
        matrix[tactic] = []
        
    for t in techniques:
        tactic_key = t.tactic
        if tactic_key not in matrix:
            matrix[tactic_key] = []
        matrix[tactic_key].append({
            "id": t.id,
            "name": t.name,
            "severity_hint": t.severity_hint,
            "observed_count": count_map.get(t.id, 0)
        })
        
    return matrix
