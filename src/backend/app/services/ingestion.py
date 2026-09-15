import io
import csv
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.asset import Asset
from app.schemas.all_schemas import IngestionStats, AlertCreate

VALID_SOURCES = {"SIEM", "Firewall", "IDS", "Endpoint", "Intelligence Report", "Satellite Feed", "Network Sensor"}
VALID_SEVERITIES = {"critical", "high", "medium", "low", "info"}

def normalise_alert_dict(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize input fields into the standard CLARION schema."""
    alert_id = raw.get("id") or raw.get("alert_id") or f"ALT-{str(uuid.uuid4())[:8].upper()}"
    
    # Parse timestamp
    raw_ts = raw.get("timestamp") or raw.get("time") or raw.get("event_time") or raw.get("observed_at")
    ts = datetime.utcnow()
    if raw_ts:
        if isinstance(raw_ts, datetime):
            ts = raw_ts
        else:
            try:
                ts = datetime.fromisoformat(str(raw_ts).replace("Z", "+00:00").split("+")[0])
            except Exception:
                ts = datetime.utcnow()
                
    source = str(raw.get("source", "SIEM")).strip()
    if source not in VALID_SOURCES:
        # Match case-insensitively or default
        matched = next((s for s in VALID_SOURCES if s.lower() == source.lower()), "SIEM")
        source = matched

    severity = str(raw.get("severity", "medium")).lower().strip()
    if severity not in VALID_SEVERITIES:
        severity = "medium"

    return {
        "id": alert_id,
        "timestamp": ts,
        "source": source,
        "source_type": str(raw.get("source_type") or raw.get("type") or "network_event"),
        "event_type": str(raw.get("event_type") or raw.get("signature") or raw.get("name") or "suspicious_activity"),
        "severity": severity,
        "src_ip": raw.get("src_ip") or raw.get("source_ip") or raw.get("attacker_ip"),
        "dst_ip": raw.get("dst_ip") or raw.get("destination_ip") or raw.get("target_ip"),
        "user": raw.get("user") or raw.get("username") or raw.get("account"),
        "hostname": raw.get("hostname") or raw.get("host"),
        "asset_id": raw.get("asset_id") or raw.get("target_asset"),
        "description": str(raw.get("description") or raw.get("msg") or raw.get("message") or f"Alert from {source}"),
        "raw_data": json.dumps(raw.get("raw_data") or raw),
        "mitre_technique_id": raw.get("mitre_technique_id") or raw.get("technique_id")
    }

def process_alert_records(records: List[Dict[str, Any]], db: Session) -> Tuple[IngestionStats, List[Alert]]:
    """Validate, deduplicate, normalize, and store alerts into the database."""
    stats = IngestionStats(
        records_received=len(records),
        valid_records=0,
        invalid_records=0,
        duplicates=0,
        new_alerts=0
    )
    
    created_alerts = []
    
    # Load known assets for validation / association
    known_assets = {a.id: a for a in db.query(Asset).all()}
    known_hostnames = {a.hostname.lower(): a.id for a in known_assets.values()}
    
    for record in records:
        try:
            norm = normalise_alert_dict(record)
            
            # Auto-link asset if hostname matches
            if not norm.get("asset_id") and norm.get("hostname"):
                host_key = norm["hostname"].lower()
                if host_key in known_hostnames:
                    norm["asset_id"] = known_hostnames[host_key]
                    
            # Check duplicate in database
            existing = db.query(Alert).filter(Alert.id == norm["id"]).first()
            if existing:
                stats.duplicates += 1
                continue
                
            # Secondary deduplication: same asset + same event_type within last 5 minutes
            recent_dup = db.query(Alert).filter(
                Alert.asset_id == norm.get("asset_id"),
                Alert.event_type == norm["event_type"],
                Alert.source == norm["source"],
                Alert.src_ip == norm.get("src_ip")
            ).order_by(Alert.timestamp.desc()).first()
            
            if recent_dup and abs((norm["timestamp"] - recent_dup.timestamp).total_seconds()) < 300:
                stats.duplicates += 1
                continue
                
            alert_obj = Alert(**norm)
            db.add(alert_obj)
            created_alerts.append(alert_obj)
            stats.valid_records += 1
            stats.new_alerts += 1
            
        except Exception as e:
            stats.invalid_records += 1
            
    db.commit()
    stats.details = f"Successfully ingested {stats.new_alerts} alerts out of {stats.records_received} records received."
    return stats, created_alerts

def parse_csv_bytes(file_bytes: bytes, db: Session) -> Tuple[IngestionStats, List[Alert]]:
    """Parse CSV alert file into structured alert records."""
    text_stream = io.StringIO(file_bytes.decode("utf-8", errors="replace"))
    reader = csv.DictReader(text_stream)
    records = [row for row in reader]
    return process_alert_records(records, db)

def parse_json_bytes(file_bytes: bytes, db: Session) -> Tuple[IngestionStats, List[Alert]]:
    """Parse JSON alert file (array or newline-delimited) into alert records."""
    content = file_bytes.decode("utf-8", errors="replace").strip()
    records = []
    if content.startswith("["):
        records = json.loads(content)
    else:
        for line in content.splitlines():
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return process_alert_records(records, db)
