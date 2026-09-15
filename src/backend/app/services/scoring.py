from typing import List, Dict, Any
from app.models.alert import Alert
from app.models.asset import Asset
from sqlalchemy.orm import Session

SEVERITY_WEIGHTS = {
    "critical": 1.0,
    "high": 0.8,
    "medium": 0.5,
    "low": 0.25,
    "info": 0.1
}

ASSET_CRITICALITY_SCORES = {
    "CRITICAL": 25.0,
    "HIGH": 18.0,
    "MEDIUM": 10.0,
    "LOW": 5.0
}

KILLCHAIN_IMPACT_SCORES = {
    "Impact": 10.0,
    "Exfiltration": 10.0,
    "Command and Control": 8.5,
    "Credential Access": 8.0,
    "Privilege Escalation": 7.5,
    "Lateral Movement": 7.0,
    "Execution": 6.0,
    "Initial Access": 4.5,
    "Reconnaissance": 2.0,
    "Discovery": 3.0
}

def calculate_incident_risk(alerts: List[Alert], db: Session) -> Dict[str, Any]:
    """Calculate an explainable 0-100 risk score with transparent mathematical breakdown."""
    if not alerts:
        return {
            "severity": 0.0,
            "asset_criticality": 0.0,
            "correlation": 0.0,
            "confidence": 0.0,
            "impact": 0.0,
            "total": 0.0,
            "priority": "LOW"
        }

    # 1. Severity Score (Max 25 pts)
    sev_values = [SEVERITY_WEIGHTS.get(a.severity.lower(), 0.5) for a in alerts]
    max_sev = max(sev_values)
    avg_sev = sum(sev_values) / len(sev_values)
    # Blend max severity (70%) and average severity (30%)
    severity_factor = (max_sev * 0.70 + avg_sev * 0.30) * 25.0
    severity_score = round(min(25.0, severity_factor), 1)

    # 2. Asset Criticality Score (Max 25 pts)
    asset_ids = list({a.asset_id for a in alerts if a.asset_id})
    highest_asset_crit = "MEDIUM"
    if asset_ids:
        assets = db.query(Asset).filter(Asset.id.in_(asset_ids)).all()
        tiers = [a.criticality.upper() for a in assets]
        if "CRITICAL" in tiers:
            highest_asset_crit = "CRITICAL"
        elif "HIGH" in tiers:
            highest_asset_crit = "HIGH"
        elif "MEDIUM" in tiers:
            highest_asset_crit = "MEDIUM"
        else:
            highest_asset_crit = "LOW"
            
    asset_criticality_score = ASSET_CRITICALITY_SCORES.get(highest_asset_crit, 10.0)

    # 3. Correlation Strength (Max 20 pts)
    distinct_sources = len({a.source for a in alerts})
    unique_entities = len({a.src_ip for a in alerts if a.src_ip} | {a.user for a in alerts if a.user})
    
    if distinct_sources >= 4:
        base_corr = 17.0
    elif distinct_sources == 3:
        base_corr = 14.0
    elif distinct_sources == 2:
        base_corr = 10.0
    else:
        base_corr = 6.0

    # Entity corroboration bonus
    corr_bonus = min(3.0, len(alerts) * 0.3)
    correlation_score = round(min(20.0, base_corr + corr_bonus), 1)

    # 4. Confidence Score (Max 20 pts)
    # Checks corroborated feeds and verified signatures
    has_ioc_match = any("threat_intel" in (a.source_type or "").lower() or a.source == "Intelligence Report" for a in alerts)
    has_critical_sig = any(a.severity == "critical" for a in alerts)
    
    if has_ioc_match and len(alerts) >= 5:
        confidence_score = 19.0
    elif has_critical_sig and distinct_sources >= 2:
        confidence_score = 17.5
    elif len(alerts) >= 3:
        confidence_score = 15.0
    else:
        confidence_score = 11.0

    # 5. Observed Impact Score (Max 10 pts)
    impact_candidates = [2.0]
    for a in alerts:
        evt = (a.event_type or "").lower()
        if "exfiltration" in evt or "destruction" in evt:
            impact_candidates.append(10.0)
        elif "c2" in evt or "beacon" in evt:
            impact_candidates.append(8.5)
        elif "credential" in evt or "dump" in evt:
            impact_candidates.append(8.0)
        elif "privilege" in evt:
            impact_candidates.append(7.5)
        elif "powershell" in evt or "execution" in evt:
            impact_candidates.append(6.0)
        elif "login" in evt or "phish" in evt:
            impact_candidates.append(4.5)
            
    impact_score = round(max(impact_candidates), 1)

    # Compute Total (0-100)
    total_score = round(severity_score + asset_criticality_score + correlation_score + confidence_score + impact_score, 1)
    total_score = min(100.0, max(0.0, total_score))

    # Priority mapping
    if total_score >= 85.0:
        priority = "CRITICAL"
    elif total_score >= 70.0:
        priority = "HIGH"
    elif total_score >= 40.0:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    return {
        "severity": severity_score,
        "asset_criticality": asset_criticality_score,
        "correlation": correlation_score,
        "confidence": confidence_score,
        "impact": impact_score,
        "total": total_score,
        "priority": priority
    }
