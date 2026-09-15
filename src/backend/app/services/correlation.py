import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.asset import Asset
from app.models.mitre import MitreTechnique
from app.services.scoring import calculate_incident_risk
from app.core.config import settings

def derive_incident_title(alerts: List[Alert]) -> str:
    """Generate an informative operational incident title from correlated alert characteristics."""
    event_types = [a.event_type.lower() for a in alerts]
    
    if any("modbus" in e or "scada" in e for e in event_types):
        return "SCADA Operational Technology Protocol Tampering"
    elif any("credential" in e or "dump" in e for e in event_types) and any("c2" in e or "beacon" in e for e in event_types):
        return "Coordinated Credential Theft & Covert C2 Campaign"
    elif any("credential" in e or "dump" in e or "kerberos" in e for e in event_types):
        return "Targeted Active Directory Credential Access Attempt"
    elif any("powershell" in e or "privilege" in e for e in event_types):
        return "Privileged Script Execution & Host Compromise"
    elif any("recon" in e or "scan" in e for e in event_types) and any("login" in e for e in event_types):
        return "External Ingress Probe & Authentication Spray"
    elif any("exfiltration" in e or "transfer" in e for e in event_types):
        return "Critical Asset Data Staging & Exfiltration Attempt"
    else:
        return f"Correlated Multi-Source Intrusion on {alerts[0].hostname or 'Host'}"

def generate_correlation_explanations(alerts: List[Alert], db: Session) -> List[str]:
    """Generate explainable, transparent bullet points stating why alerts were correlated."""
    if not alerts:
        return ["+ Insufficient alerts for correlation justification."]

    explanations = []
    
    # 1. Assets analysis
    assets = list({a.asset_id for a in alerts if a.asset_id})
    hostnames = list({a.hostname for a in alerts if a.hostname})
    if len(assets) == 1:
        ast = db.query(Asset).filter(Asset.id == assets[0]).first()
        name = f"{ast.id} ({ast.hostname})" if ast else assets[0]
        explanations.append(f"+ Same targeted critical asset: {name}")
    elif len(assets) > 1:
        explanations.append(f"+ Lateral movement targeting {len(assets)} interconnected assets: {', '.join(assets[:3])}")
    elif hostnames:
        explanations.append(f"+ Converged on common host endpoint: {hostnames[0]}")

    # 2. User account analysis
    users = list({a.user for a in alerts if a.user and a.user.lower() not in ["none", "null"]})
    if len(users) == 1:
        explanations.append(f"+ Same authenticated user identity: {users[0]}")
    elif len(users) > 1:
        explanations.append(f"+ User account pivot across: {', '.join(users[:3])}")

    # 3. Source IP / External Infrastructure
    src_ips = list({a.src_ip for a in alerts if a.src_ip and not a.src_ip.startswith("10.")})
    if src_ips:
        explanations.append(f"+ Shared hostile external origin/C2 IP: {src_ips[0]}")

    # 4. Multi-source discipline corroboration
    sources = list({a.source for a in alerts})
    if len(sources) >= 2:
        explanations.append(f"+ Cross-discipline corroboration across {len(sources)} INT sources: {', '.join(sources)}")
    else:
        explanations.append(f"+ Clustered alerts from primary sensor: {sources[0] if sources else 'Sensor'}")

    # 5. Temporal sequence
    sorted_alerts = sorted(alerts, key=lambda a: a.timestamp)
    time_delta = round((sorted_alerts[-1].timestamp - sorted_alerts[0].timestamp).total_seconds() / 60.0)
    explanations.append(f"+ Temporal convergence: {len(alerts)} alerts triggered within a {max(1, time_delta)}-minute sliding window")

    # 6. Kill-chain attack progression
    techniques = list({a.mitre_technique_id for a in alerts if a.mitre_technique_id})
    if len(techniques) >= 2:
        explanations.append(f"+ Attack chain progression confirmed across {len(techniques)} MITRE ATT&CK techniques")

    return explanations

def extract_mitre_mappings(alerts: List[Alert], db: Session) -> List[Dict[str, Any]]:
    """Compile distinct MITRE techniques observed with concrete evidence snippets."""
    tech_ids = list({a.mitre_technique_id for a in alerts if a.mitre_technique_id})
    if not tech_ids:
        return []

    techniques = db.query(MitreTechnique).filter(MitreTechnique.id.in_(tech_ids)).all()
    tech_map = {t.id: t for t in techniques}

    mappings = []
    for tid in tech_ids:
        tech = tech_map.get(tid)
        matching_alerts = [a for a in alerts if a.mitre_technique_id == tid]
        evidence_msg = matching_alerts[0].description if matching_alerts else "Observed malicious activity sequence"
        
        # Calculate confidence based on corroborating alerts
        conf = 92 if len(matching_alerts) >= 2 else 85
        
        mappings.append({
            "tactic": tech.tactic if tech else "Execution",
            "technique_id": tid,
            "technique_name": tech.name if tech else "Unknown Technique",
            "confidence": conf,
            "evidence": evidence_msg,
            "is_suspected": False
        })
        
    return mappings

def correlate_unassigned_alerts(db: Session) -> List[Incident]:
    """
    Run multi-factor correlation over unassigned alerts.
    Clusters alerts sharing strong entity keys within the configured time window.
    """
    window_minutes = settings.CORRELATION_WINDOW_MINUTES
    unassigned = db.query(Alert).filter(Alert.incident_id.is_(None)).order_by(Alert.timestamp.asc()).all()
    
    if not unassigned:
        return []

    # Group by strong entity key (asset_id or hostname or src_ip)
    clusters: Dict[str, List[Alert]] = {}
    for alt in unassigned:
        key = alt.asset_id or alt.hostname or alt.src_ip or "unspecified"
        if key not in clusters:
            clusters[key] = []
        clusters[key].append(alt)

    new_incidents = []
    
    for key, cluster_alerts in clusters.items():
        if len(cluster_alerts) < 2 and cluster_alerts[0].severity not in ["critical", "high"]:
            # Leave lone low/info alerts for future batch or manual inspection
            continue

        # Check temporal window: split if time gap exceeds window
        sorted_cluster = sorted(cluster_alerts, key=lambda a: a.timestamp)
        sub_clusters = []
        current_sub = [sorted_cluster[0]]
        
        for next_alt in sorted_cluster[1:]:
            diff = (next_alt.timestamp - current_sub[-1].timestamp).total_seconds() / 60.0
            if diff <= window_minutes * 2: # sliding proximity
                current_sub.append(next_alt)
            else:
                sub_clusters.append(current_sub)
                current_sub = [next_alt]
        sub_clusters.append(current_sub)

        for sub in sub_clusters:
            # Generate new Incident ID
            existing_count = db.query(Incident).count()
            inc_id = f"INC-{existing_count + 1:03d}"
            
            # Score
            scoring_result = calculate_incident_risk(sub, db)
            
            # Explanations
            explanations = generate_correlation_explanations(sub, db)
            
            # MITRE
            mitre_maps = extract_mitre_mappings(sub, db)
            
            # Title
            title = derive_incident_title(sub)
            
            first_seen = min(a.timestamp for a in sub)
            last_seen = max(a.timestamp for a in sub)
            affected_count = len({a.asset_id for a in sub if a.asset_id}) or 1
            
            inc = Incident(
                id=inc_id,
                title=title,
                status="ACTIVE",
                priority=scoring_result["priority"],
                risk_score=scoring_result["total"],
                confidence=85.0,
                assigned_analyst="SecOps Automation",
                first_seen=first_seen,
                last_seen=last_seen,
                affected_assets_count=affected_count,
                alerts_count=len(sub),
                score_breakdown=json.dumps(scoring_result),
                correlation_explanation=json.dumps(explanations),
                mitre_mappings=json.dumps(mitre_maps),
                bluf_summary=f"BLUF: Threat correlated on {key}. Priority: {scoring_result['priority']} (Risk: {scoring_result['total']}/100).",
                is_synthetic=any(a.is_synthetic for a in sub)
            )
            db.add(inc)
            db.flush() # assign ID
            
            for a in sub:
                a.incident_id = inc_id
                
            new_incidents.append(inc)

    db.commit()
    return new_incidents
