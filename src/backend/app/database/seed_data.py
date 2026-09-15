import json
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.models.asset import Asset
from app.models.mitre import MitreTechnique
from app.models.indicator import Indicator
from app.models.campaign import Campaign
from app.models.incident import Incident
from app.models.alert import Alert
from app.models.report import Report
from app.models.audit import AuditLog

MITRE_TECHNIQUES_DATA = [
    {"id": "T1595", "tactic": "Reconnaissance", "name": "Active Scanning", "severity_hint": "MEDIUM", "description": "Adversaries may execute active scanning to gather information about network hosts, services, and vulnerabilities."},
    {"id": "T1566", "tactic": "Initial Access", "name": "Phishing", "severity_hint": "HIGH", "description": "Adversaries may send phishing messages with malicious attachments or links to gain initial access."},
    {"id": "T1078", "tactic": "Initial Access", "name": "Valid Accounts", "severity_hint": "HIGH", "description": "Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, or Defense Evasion."},
    {"id": "T1059", "tactic": "Execution", "name": "Command and Scripting Interpreter", "severity_hint": "HIGH", "description": "Adversaries may abuse command and script interpreters to execute arbitrary commands, scripts, or binaries."},
    {"id": "T1053", "tactic": "Execution", "name": "Scheduled Task/Job", "severity_hint": "MEDIUM", "description": "Adversaries may abuse task scheduling functionality to facilitate initial or recurring execution of malicious code."},
    {"id": "T1068", "tactic": "Privilege Escalation", "name": "Exploitation for Privilege Escalation", "severity_hint": "CRITICAL", "description": "Adversaries may exploit software vulnerabilities in an attempt to elevate privileges on target systems."},
    {"id": "T1134", "tactic": "Privilege Escalation", "name": "Access Token Manipulation", "severity_hint": "CRITICAL", "description": "Adversaries may modify access tokens to operate under a different user or system security context."},
    {"id": "T1003", "tactic": "Credential Access", "name": "OS Credential Dumping", "severity_hint": "CRITICAL", "description": "Adversaries may attempt to dump credentials to obtain account login and credential material, normally in the form of a hash or clear text."},
    {"id": "T1110", "tactic": "Credential Access", "name": "Brute Force", "severity_hint": "MEDIUM", "description": "Adversaries may use brute force techniques to attempt access to accounts when passwords or hashes are unknown."},
    {"id": "T1087", "tactic": "Discovery", "name": "Account Discovery", "severity_hint": "LOW", "description": "Adversaries may attempt to get a listing of valid accounts on a system or within an environment."},
    {"id": "T1046", "tactic": "Discovery", "name": "Network Service Discovery", "severity_hint": "LOW", "description": "Adversaries may attempt to get a listing of services running on remote hosts to identify vulnerable services."},
    {"id": "T1021", "tactic": "Lateral Movement", "name": "Remote Services", "severity_hint": "HIGH", "description": "Adversaries may use Valid Accounts to log into remote services such as SSH, RDP, or SMB."},
    {"id": "T1071", "tactic": "Command and Control", "name": "Application Layer Protocol", "severity_hint": "HIGH", "description": "Adversaries may communicate using application layer protocols (HTTP/HTTPS/DNS) to avoid detection/network filtering."},
    {"id": "T1573", "tactic": "Command and Control", "name": "Encrypted Channel", "severity_hint": "HIGH", "description": "Adversaries may employ a known encryption algorithm to conceal command and control traffic."},
    {"id": "T1560", "tactic": "Collection", "name": "Archive Collected Data", "severity_hint": "MEDIUM", "description": "An adversary may compress and/or encrypt data that is collected prior to exfiltration."},
    {"id": "T1048", "tactic": "Exfiltration", "name": "Exfiltration Over Alternative Protocol", "severity_hint": "CRITICAL", "description": "Adversaries may steal data by transferring it through an alternative protocol channel."},
    {"id": "T1485", "tactic": "Impact", "name": "Data Destruction", "severity_hint": "CRITICAL", "description": "Adversaries may destroy data and files on specific systems or in large numbers on a network to interrupt availability."}
]

ASSETS_DATA = [
    {"id": "ASSET-104", "hostname": "dc-primary.mil.net", "type": "Domain Controller / Command Server", "criticality": "CRITICAL", "owner": "SecOps Cyber Command", "location": "Primary Operations Bunker (Sector 4)", "ip_address": "10.10.4.10", "status": "INVESTIGATING", "current_risk": 94.0},
    {"id": "ASSET-107", "hostname": "scada-gw-01.grid.local", "type": "SCADA Telemetry Gateway", "criticality": "CRITICAL", "owner": "Infrastructure Defense Directorate", "location": "Substation Alpha-1", "ip_address": "10.20.1.1", "status": "OPERATIONAL", "current_risk": 86.0},
    {"id": "ASSET-112", "hostname": "sat-uplink-node2.norfolk.navy", "type": "Satellite Tactical Downlink", "criticality": "CRITICAL", "owner": "Naval Signals Command", "location": "Naval Station Norfolk", "ip_address": "10.30.5.2", "status": "OPERATIONAL", "current_risk": 78.0},
    {"id": "ASSET-120", "hostname": "intel-db-master.soc.mil", "type": "Classified Intelligence DB", "criticality": "CRITICAL", "owner": "Joint Intelligence Task Force", "location": "Fort Meade Data Center", "ip_address": "10.10.2.15", "status": "OPERATIONAL", "current_risk": 72.0},
    {"id": "ASSET-135", "hostname": "logistics-core-sw.depot.army", "type": "Logistics Core Switch", "criticality": "HIGH", "owner": "Army Materiel Command", "location": "Logistics Depot Red River", "ip_address": "10.40.10.1", "status": "OPERATIONAL", "current_risk": 64.0},
    {"id": "ASSET-142", "hostname": "radar-ew-alpha.air.mil", "type": "Early Warning Radar Sensor", "criticality": "HIGH", "owner": "Air Defense Command", "location": "Radar Site Sentinel Peak", "ip_address": "10.50.8.22", "status": "OPERATIONAL", "current_risk": 58.0},
    {"id": "ASSET-189", "hostname": "analyst-ws-12.hq.mil", "type": "SOC Analyst Workstation", "criticality": "MEDIUM", "owner": "Watch Floor Alpha", "location": "Pentagon Room 2C-100", "ip_address": "10.10.99.12", "status": "OPERATIONAL", "current_risk": 32.0},
    {"id": "ASSET-204", "hostname": "backup-vault-01.dc.mil", "type": "Encrypted Backup Vault", "criticality": "MEDIUM", "owner": "Disaster Recovery Unit", "location": "Underground Facility Cheyenne", "ip_address": "10.10.88.5", "status": "OPERATIONAL", "current_risk": 24.0}
]

INDICATORS_DATA = [
    {"id": "IOC-001", "indicator_type": "IP", "value": "198.51.100.45", "threat_actor": "APT-29 (COZY BEAR)", "source": "US-CYBERCOM Threat Feed", "confidence": 95, "tags": "c2,apt,state-sponsored", "description": "Known Command and Control server used in credential harvesting campaigns."},
    {"id": "IOC-002", "indicator_type": "IP", "value": "203.0.113.88", "threat_actor": "APT-28 (FANCY BEAR)", "source": "NATO Cyber Intelligence", "confidence": 90, "tags": "brute-force,recon,proxy", "description": "Active bulletproof proxy node conducting credential spraying against defence networks."},
    {"id": "IOC-003", "indicator_type": "DOMAIN", "value": "telemetry-sync-cdn.com", "threat_actor": "UNC-2452", "source": "Mandiant Threat Feed", "confidence": 92, "tags": "dga,beaconing,c2", "description": "Domain masquerading as a legitimate cloud telemetry provider used for encrypted exfiltration."},
    {"id": "IOC-004", "indicator_type": "DOMAIN", "value": "updates-microsoft-security.net", "threat_actor": "Volt Typhoon", "source": "CISA Advisory", "confidence": 88, "tags": "phishing,typosquatting", "description": "Deceptive domain hosting credential-harvesting landing pages targeting government personnel."},
    {"id": "IOC-005", "indicator_type": "HASH_SHA256", "value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "threat_actor": "Lazarus Group", "source": "NSA Cybersecurity Directorate", "confidence": 98, "tags": "mimikatz,credential-dump,memory-injection", "description": "Modified LSASS memory injector binary signature designed to evade EDR hooks."},
    {"id": "IOC-006", "indicator_type": "HASH_SHA256", "value": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", "threat_actor": "Sandworm Team", "source": "DoD Cyber Crime Center", "confidence": 94, "tags": "powershell,obfuscated,reverse-shell", "description": "Base64 encoded multi-stage PowerShell downloader script payload."}
]

def seed_database(db: Session):
    """Seed initial reference data, baseline alerts, and incidents."""
    # Check if already seeded
    if db.query(Asset).count() > 0:
        return

    print("[CLARION] Seeding initial MITRE techniques...")
    for t in MITRE_TECHNIQUES_DATA:
        db.add(MitreTechnique(**t))
    
    print("[CLARION] Seeding critical assets...")
    for a in ASSETS_DATA:
        db.add(Asset(**a))
        
    print("[CLARION] Seeding threat intelligence indicators...")
    for i in INDICATORS_DATA:
        db.add(Indicator(**i))

    db.commit()

    # Create baseline campaigns
    camp1 = Campaign(
        id="CAM-001",
        name="Operation Nightfall",
        status="ACTIVE",
        threat_actor="APT-29 / COZY BEAR (Suspected)",
        risk_score=94.0,
        confidence=92.0,
        first_seen=datetime.utcnow() - timedelta(hours=3),
        last_seen=datetime.utcnow() - timedelta(minutes=15),
        description="Coordinated multi-stage attack targeting Primary Domain Controllers and Critical SCADA Telemetry infrastructure using credential access and covert C2 channels.",
        is_synthetic=True
    )
    db.add(camp1)
    
    camp2 = Campaign(
        id="CAM-002",
        name="Operation Iron Sentry",
        status="CONTAINED",
        threat_actor="Unknown Cyber Espionage Group",
        risk_score=78.0,
        confidence=85.0,
        first_seen=datetime.utcnow() - timedelta(days=2),
        last_seen=datetime.utcnow() - timedelta(hours=14),
        description="Reconnaissance and lateral movement probing across satellite tactical uplink communications relays.",
        is_synthetic=False
    )
    db.add(camp2)
    db.commit()

    # Create Lead Incident: INC-001 (High-profile target of Operation Nightfall)
    inc1_score = {
        "severity": 24.0,
        "asset_criticality": 25.0,
        "correlation": 18.0,
        "confidence": 18.0,
        "impact": 9.0,
        "total": 94.0
    }
    
    inc1_correlation = [
        "+ Same affected asset (ASSET-104 - dc-primary.mil.net)",
        "+ Same compromised identity (admin_svc / NT AUTHORITY\\SYSTEM)",
        "+ Corroborated across 4 distinct INT sources: SIEM, EDR, Network Sensor, Firewall",
        "+ Tight temporal sequence: 6 alerts triggered within a 14-minute execution window",
        "+ Attacker IP 198.51.100.45 matches verified APT-29 C2 node in Threat Intelligence"
    ]
    
    inc1_mitre = [
        {"tactic": "Initial Access", "technique_id": "T1078", "technique_name": "Valid Accounts", "confidence": 92, "evidence": "Anomalous authentication burst from external gateway IP using svc_backup credentials.", "is_suspected": False},
        {"tactic": "Execution", "technique_id": "T1059", "technique_name": "Command and Scripting Interpreter", "confidence": 95, "evidence": "Encoded PowerShell invocation launching obfuscated stager via process injection.", "is_suspected": False},
        {"tactic": "Privilege Escalation", "technique_id": "T1134", "technique_name": "Access Token Manipulation", "confidence": 90, "evidence": "Local security privilege token duplication detected in lsass.exe process memory.", "is_suspected": False},
        {"tactic": "Credential Access", "technique_id": "T1003", "technique_name": "OS Credential Dumping", "confidence": 94, "evidence": "Memory dump request issued against Active Directory SAM database.", "is_suspected": False},
        {"tactic": "Command and Control", "technique_id": "T1071", "technique_name": "Application Layer Protocol", "confidence": 88, "evidence": "Continuous TLS beaconing observed towards known hostile IP 198.51.100.45.", "is_suspected": False}
    ]

    inc1_bluf = (
        "BOTTOM LINE UP FRONT (BLUF):\n"
        "A coordinated high-severity cyber intrusion (Operation Nightfall) is actively targeting the primary domain controller "
        "and command server (ASSET-104). Four independent sensor disciplines corroborate active credential dumping and ongoing "
        "command-and-control beaconing to an identified hostile external infrastructure (198.51.100.45).\n\n"
        "WHAT HAPPENED:\n"
        "Adversary leveraged compromised service credentials (svc_backup) for initial ingress, escalated privileges via access token "
        "manipulation, and dumped Active Directory credentials from memory before establishing an encrypted outbound C2 beacon.\n\n"
        "WHY IT MATTERS:\n"
        "Compromise of ASSET-104 threatens total domain persistence and unauthorized traversal across mission-critical command networks. "
        "Immediate asset isolation and credential invalidation are required.\n\n"
        "RECOMMENDED IMMEDIATE ACTION:\n"
        "1. Isolate ASSET-104 at the network boundary.\n"
        "2. Sever egress sessions to 198.51.100.45 at the border firewall.\n"
        "3. Force emergency password rotation on all privileged administrative and service accounts."
    )

    inc1 = Incident(
        id="INC-001",
        title="Possible Credential Compromise & C2 Campaign",
        status="ACTIVE",
        priority="CRITICAL",
        risk_score=94.0,
        confidence=92.0,
        campaign_id="CAM-001",
        assigned_analyst="Maj. C. Vance (SecOps Lead)",
        first_seen=datetime.utcnow() - timedelta(hours=2, minutes=45),
        last_seen=datetime.utcnow() - timedelta(minutes=18),
        affected_assets_count=7,
        alerts_count=12,
        score_breakdown=json.dumps(inc1_score),
        correlation_explanation=json.dumps(inc1_correlation),
        mitre_mappings=json.dumps(inc1_mitre),
        bluf_summary=inc1_bluf,
        investigation_notes=json.dumps([
            {"timestamp": (datetime.utcnow() - timedelta(minutes=45)).isoformat(), "analyst": "Maj. C. Vance", "note": "Initial correlation verified. Hostile IP matches NSA/CYBERCOM advisory for APT-29."},
            {"timestamp": (datetime.utcnow() - timedelta(minutes=25)).isoformat(), "analyst": "Capt. S. Miller", "note": "Firewall containment rule drafted. Awaiting watch commander authorization."}
        ]),
        is_synthetic=True
    )
    db.add(inc1)

    # Secondary Incidents to reach realistic initial stats
    inc2_score = {"severity": 20.0, "asset_criticality": 25.0, "correlation": 16.0, "confidence": 17.0, "impact": 8.0, "total": 86.0}
    inc2 = Incident(
        id="INC-002",
        title="SCADA Telemetry Protocol Tampering",
        status="ACTIVE",
        priority="CRITICAL",
        risk_score=86.0,
        confidence=88.0,
        campaign_id="CAM-001",
        assigned_analyst="Capt. S. Miller",
        first_seen=datetime.utcnow() - timedelta(hours=1, minutes=30),
        last_seen=datetime.utcnow() - timedelta(minutes=22),
        affected_assets_count=2,
        alerts_count=8,
        score_breakdown=json.dumps(inc2_score),
        correlation_explanation=json.dumps(["+ Shared targeting of operational grid infrastructure", "+ High-frequency Modbus exception packets"]),
        mitre_mappings=json.dumps([{"tactic": "Impact", "technique_id": "T1485", "technique_name": "Data Destruction", "confidence": 85, "evidence": "PLC write attempts with invalid control setpoints."}]),
        bluf_summary="BLUF: SCADA Telemetry Gateway exhibiting unauthorized command sequence bursts. Potential grid subversion attempt.",
        is_synthetic=True
    )
    db.add(inc2)

    # Add other active incidents (total 8 critical, 23 high, etc. across the database)
    other_incidents_data = [
        ("INC-003", "Tactical Satellite Uplink Jamming & Relay Probe", "CRITICAL", 82.0, "ASSET-112", "CAM-002", "ACTIVE"),
        ("INC-004", "Classified Intel DB Bulk Data Staging", "CRITICAL", 81.0, "ASSET-120", None, "ACTIVE"),
        ("INC-005", "Logistics Core Switch Firmware Modification", "HIGH", 76.0, "ASSET-135", None, "ACTIVE"),
        ("INC-006", "Radar Sensor Telemetry Desynchronization", "HIGH", 74.0, "ASSET-142", None, "ACTIVE"),
        ("INC-007", "Automated Kerberoasting Activity", "HIGH", 72.0, "ASSET-104", None, "ACTIVE"),
        ("INC-008", "Outbound Beaconing to Bulletproof Host", "HIGH", 71.0, "ASSET-189", None, "ACTIVE"),
        ("INC-009", "Routine Nessus Scanner Sweep (False Positive)", "LOW", 22.0, "ASSET-204", None, "FALSE_POSITIVE"),
        ("INC-010", "Authorized Backup Vault Sync Burst (False Positive)", "LOW", 18.0, "ASSET-204", None, "FALSE_POSITIVE")
    ]
    
    for inc_id, title, prio, score, asset_ref, camp_ref, stat in other_incidents_data:
        sb = {
            "severity": score * 0.25,
            "asset_criticality": score * 0.25,
            "correlation": score * 0.20,
            "confidence": score * 0.20,
            "impact": score * 0.10,
            "total": score
        }
        fp_reason = "Authorized scheduled maintenance / vulnerability assessment activity." if stat == "FALSE_POSITIVE" else None
        db.add(Incident(
            id=inc_id,
            title=title,
            status=stat,
            priority=prio,
            risk_score=score,
            confidence=82.0 if prio != "LOW" else 95.0,
            campaign_id=camp_ref,
            assigned_analyst="SecOps Team",
            first_seen=datetime.utcnow() - timedelta(hours=random.randint(4, 36)),
            last_seen=datetime.utcnow() - timedelta(minutes=random.randint(10, 180)),
            affected_assets_count=random.randint(1, 4),
            alerts_count=random.randint(4, 25),
            score_breakdown=json.dumps(sb),
            correlation_explanation=json.dumps([f"+ Correlated via asset {asset_ref}", "+ Temporal signature clustering"]),
            mitre_mappings=json.dumps([{"tactic": "Discovery", "technique_id": "T1046", "technique_name": "Network Service Discovery", "confidence": 80, "evidence": "Port sweep on target subnet."}]),
            bluf_summary=f"BLUF: Threat detected on {asset_ref}. Priority: {prio}.",
            false_positive_reason=fp_reason,
            is_synthetic=False
        ))
    db.commit()

    # Generate Alerts for INC-001 (Operation Nightfall attack chain)
    nightfall_alerts = [
        {"id": "ALT-1001", "minutes_ago": 165, "source": "Firewall", "source_type": "network_flow", "event_type": "external_recon_scan", "severity": "medium", "src_ip": "198.51.100.45", "dst_ip": "10.10.4.10", "user": None, "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "Port scan targeting LDAP (389) and Kerberos (88) ports on DC-PRIMARY.", "mitre_technique_id": "T1595"},
        {"id": "ALT-1002", "minutes_ago": 150, "source": "SIEM", "source_type": "authentication", "event_type": "suspicious_login", "severity": "high", "src_ip": "198.51.100.45", "dst_ip": "10.10.4.10", "user": "svc_backup", "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "Multiple failed login attempts followed by successful logon using service account svc_backup from untrusted external IP.", "mitre_technique_id": "T1078"},
        {"id": "ALT-1003", "minutes_ago": 135, "source": "Endpoint", "source_type": "process_execution", "event_type": "powershell_execution", "severity": "high", "src_ip": "10.10.4.10", "dst_ip": None, "user": "svc_backup", "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "Obfuscated PowerShell command line execution: powershell.exe -enc JAB3AGMAPQBOAGUAdwAtAE8AYgBqAGUAYwB0AA==.", "mitre_technique_id": "T1059"},
        {"id": "ALT-1004", "minutes_ago": 120, "source": "Endpoint", "source_type": "process_execution", "event_type": "privilege_escalation", "severity": "critical", "src_ip": "10.10.4.10", "dst_ip": None, "user": "NT AUTHORITY\\SYSTEM", "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "SeDebugPrivilege enabled for unverified process; access token impersonated to elevated NT AUTHORITY\\SYSTEM context.", "mitre_technique_id": "T1134"},
        {"id": "ALT-1005", "minutes_ago": 105, "source": "IDS", "source_type": "memory_inspection", "event_type": "credential_dumping", "severity": "critical", "src_ip": "10.10.4.10", "dst_ip": None, "user": "NT AUTHORITY\\SYSTEM", "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "LSASS memory handle opened with PROCESS_VM_READ permissions (Mimikatz signature detected).", "mitre_technique_id": "T1003"},
        {"id": "ALT-1006", "minutes_ago": 90, "source": "Network Sensor", "source_type": "network_flow", "event_type": "c2_beaconing", "severity": "critical", "src_ip": "10.10.4.10", "dst_ip": "198.51.100.45", "user": "NT AUTHORITY\\SYSTEM", "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "Regular interval outbound TLS beacon traffic (periodicity 45s, jitter 12%) to confirmed C2 address 198.51.100.45.", "mitre_technique_id": "T1071"},
        {"id": "ALT-1007", "minutes_ago": 75, "source": "Endpoint", "source_type": "file_modification", "event_type": "data_staging", "severity": "high", "src_ip": "10.10.4.10", "dst_ip": None, "user": "NT AUTHORITY\\SYSTEM", "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "Encrypted multi-volume archive created in C:\\Windows\\Temp\\~svchost.zip.", "mitre_technique_id": "T1560"},
        {"id": "ALT-1008", "minutes_ago": 40, "source": "Firewall", "source_type": "network_flow", "event_type": "outbound_data_transfer", "severity": "critical", "src_ip": "10.10.4.10", "dst_ip": "198.51.100.45", "user": "NT AUTHORITY\\SYSTEM", "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "Sudden burst of 450MB outbound HTTPS traffic transmitted over non-standard port 8443.", "mitre_technique_id": "T1048"},
        {"id": "ALT-1009", "minutes_ago": 30, "source": "Intelligence Report", "source_type": "threat_intel_match", "event_type": "threat_intel_correlation", "severity": "high", "src_ip": "198.51.100.45", "dst_ip": None, "user": None, "hostname": "dc-primary.mil.net", "asset_id": "ASSET-104", "description": "C2 IP 198.51.100.45 positively attributed to APT-29 in NSA Flash Advisory 2026-08.", "mitre_technique_id": "T1071"},
        {"id": "ALT-1010", "minutes_ago": 25, "source": "Satellite Feed", "source_type": "rf_detection", "event_type": "sigint_intercept", "severity": "high", "src_ip": None, "dst_ip": None, "user": None, "hostname": "sat-uplink-node2.norfolk.navy", "asset_id": "ASSET-112", "description": "Satellite downlink RF interference and timing desynchronization detected near coastal installations.", "mitre_technique_id": "T1499"},
        {"id": "ALT-1011", "minutes_ago": 20, "source": "SIEM", "source_type": "lateral_movement", "event_type": "smb_exec_attempt", "severity": "critical", "src_ip": "10.10.4.10", "dst_ip": "10.20.1.1", "user": "admin_svc", "hostname": "scada-gw-01.grid.local", "asset_id": "ASSET-107", "description": "Lateral movement attempt from compromised DC-PRIMARY to SCADA Gateway via PsExec/SMB.", "mitre_technique_id": "T1021"},
        {"id": "ALT-1012", "minutes_ago": 18, "source": "Network Sensor", "source_type": "scada_telemetry", "event_type": "unauthorized_modbus_write", "severity": "critical", "src_ip": "10.10.4.10", "dst_ip": "10.20.1.1", "user": None, "hostname": "scada-gw-01.grid.local", "asset_id": "ASSET-107", "description": "Anomalous Modbus Function Code 16 (Write Multiple Registers) directed to substation PLC.", "mitre_technique_id": "T1485"}
    ]

    for alt in nightfall_alerts:
        db.add(Alert(
            id=alt["id"],
            timestamp=datetime.utcnow() - timedelta(minutes=alt["minutes_ago"]),
            source=alt["source"],
            source_type=alt["source_type"],
            event_type=alt["event_type"],
            severity=alt["severity"],
            src_ip=alt["src_ip"],
            dst_ip=alt["dst_ip"],
            user=alt["user"],
            hostname=alt["hostname"],
            asset_id=alt["asset_id"],
            description=alt["description"],
            raw_data=json.dumps({"synthetic": True, "details": alt["description"]}),
            incident_id="INC-001",
            mitre_technique_id=alt["mitre_technique_id"],
            is_synthetic=True
        ))

    # Generate additional background alerts to reflect a busy operational environment
    sources = ["SIEM", "Firewall", "IDS", "Endpoint", "Network Sensor"]
    severities = ["low", "low", "medium", "info", "high"]
    users = ["jsmith", "bwilson", "backup_agent", "guest_user", "svc_print"]
    
    print("[CLARION] Generating operational background alerts...")
    for idx in range(1013, 1080):
        t_offset = random.randint(10, 1440)
        src = random.choice(sources)
        sev = random.choice(severities)
        usr = random.choice(users)
        ast = random.choice(ASSETS_DATA)
        db.add(Alert(
            id=f"ALT-{idx}",
            timestamp=datetime.utcnow() - timedelta(minutes=t_offset),
            source=src,
            source_type="system_event",
            event_type=f"{src.lower()}_audit_log",
            severity=sev,
            src_ip=f"10.10.{random.randint(1,50)}.{random.randint(2,250)}",
            dst_ip=ast["ip_address"],
            user=usr,
            hostname=ast["hostname"],
            asset_id=ast["id"],
            description=f"Routine {sev} operational audit event recorded by {src} on {ast['hostname']}.",
            raw_data=json.dumps({"event_id": idx, "status": "logged"}),
            incident_id=None,
            mitre_technique_id=None,
            is_synthetic=False
        ))
        
    # Seed initial Report
    rep1 = Report(
        id="REP-001",
        title="Operation Nightfall: Tactical Commander Incident Briefing",
        report_type="BLUF",
        incident_id="INC-001",
        generated_by="Maj. C. Vance / Clarion AI Engine",
        created_at=datetime.utcnow() - timedelta(minutes=15),
        summary="BLUF Assessment for Operation Nightfall targeting ASSET-104 (DC-PRIMARY). Immediate host isolation and C2 block mandated.",
        content_html="""<div class='report-container'>
            <h1 style='color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 8px;'>COMMANDER THREAT BRIEFING: OPERATION NIGHTFALL</h1>
            <p><strong>INCIDENT ID:</strong> INC-001 | <strong>PRIORITY:</strong> CRITICAL | <strong>RISK SCORE:</strong> 94/100</p>
            <p><strong>AFFECTED CORE ASSET:</strong> ASSET-104 (dc-primary.mil.net) [Command Server]</p>
            <hr style='border-color: #334155;'/>
            <h3>BOTTOM LINE UP FRONT (BLUF)</h3>
            <p>A coordinated high-severity cyber intrusion (Operation Nightfall) is actively compromising the primary domain controller and command server (ASSET-104). Four independent sensor disciplines corroborate active credential dumping and ongoing command-and-control beaconing to an identified hostile external infrastructure (198.51.100.45).</p>
            <h3>KILL-CHAIN TIMELINE</h3>
            <ul>
                <li><strong>10:21 UTC</strong> - External Reconnaissance against Kerberos/LDAP</li>
                <li><strong>10:35 UTC</strong> - Suspicious authentication with svc_backup</li>
                <li><strong>10:50 UTC</strong> - Obfuscated PowerShell execution stager</li>
                <li><strong>11:05 UTC</strong> - Privilege escalation to NT AUTHORITY\\SYSTEM</li>
                <li><strong>11:20 UTC</strong> - LSASS memory dumping (T1003)</li>
                <li><strong>11:35 UTC</strong> - TLS C2 Beaconing to 198.51.100.45</li>
            </ul>
            <h3>DIRECTIVE FOR IMMEDIATE ACTION</h3>
            <ol>
                <li>Sever physical/logical egress routes for ASSET-104 immediately.</li>
                <li>Implement enterprise-wide IP null-route for 198.51.100.45.</li>
                <li>Initiate Active Directory Kerberos ticket-granting ticket (KRBTGT) double password reset.</li>
            </ol>
        </div>"""
    )
    db.add(rep1)
    
    # Audit log
    db.add(AuditLog(
        timestamp=datetime.utcnow() - timedelta(minutes=10),
        user="analyst_lead",
        action="CONFIRM_THREAT",
        target_type="INCIDENT",
        target_id="INC-001",
        details="Incident INC-001 confirmed as verified active threat. Correlated with APT-29 threat intel."
    ))

    db.commit()
    print("[CLARION] Database seeding completed successfully.")
