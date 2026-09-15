import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.models.alert import Alert
from app.models.asset import Asset
from app.models.incident import Incident
from app.services.ingestion import process_alert_records
from app.services.scoring import calculate_incident_risk
from app.services.correlation import generate_correlation_explanations, extract_mitre_mappings
from app.ai.demo_ai import DemoAIProvider

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSession()
    
    # Seed asset
    asset = Asset(
        id="ASSET-104",
        hostname="dc-primary.mil.net",
        type="Domain Controller",
        criticality="CRITICAL",
        owner="SecOps",
        location="Sector 4",
        ip_address="10.10.4.10"
    )
    session.add(asset)
    session.commit()
    
    yield session
    session.close()

def test_alert_ingestion_and_normalization(db_session):
    raw_alerts = [
        {
            "id": "ALT-T01",
            "source": "Firewall",
            "event_type": "port_scan",
            "severity": "high",
            "src_ip": "198.51.100.45",
            "dst_ip": "10.10.4.10",
            "hostname": "dc-primary.mil.net",
            "description": "Port scan against port 389"
        },
        {
            "id": "ALT-T02",
            "source": "SIEM",
            "event_type": "suspicious_login",
            "severity": "critical",
            "src_ip": "198.51.100.45",
            "dst_ip": "10.10.4.10",
            "user": "svc_backup",
            "hostname": "dc-primary.mil.net",
            "description": "Successful anomalous login"
        }
    ]
    
    stats, alerts = process_alert_records(raw_alerts, db_session)
    assert stats.valid_records == 2
    assert stats.new_alerts == 2
    assert alerts[0].asset_id == "ASSET-104"
    assert alerts[1].severity == "critical"

def test_explainable_risk_scoring(db_session):
    # Ingest 2 alerts on critical asset
    raw_alerts = [
        {"id": "ALT-S01", "source": "SIEM", "event_type": "suspicious_login", "severity": "high", "asset_id": "ASSET-104", "description": "test"},
        {"id": "ALT-S02", "source": "Endpoint", "event_type": "credential_dump", "severity": "critical", "asset_id": "ASSET-104", "description": "test"}
    ]
    _, alerts = process_alert_records(raw_alerts, db_session)
    
    score_result = calculate_incident_risk(alerts, db_session)
    assert score_result["asset_criticality"] == 25.0
    assert score_result["severity"] > 20.0
    assert score_result["correlation"] > 0.0
    assert score_result["total"] >= 70.0
    assert score_result["priority"] in ["CRITICAL", "HIGH"]

def test_demo_ai_bluf_generation(db_session):
    inc = Incident(
        id="INC-TEST",
        title="Test Credential Intrusion",
        priority="CRITICAL",
        risk_score=94.0,
        status="ACTIVE"
    )
    asset = db_session.query(Asset).first()
    provider = DemoAIProvider()
    
    bluf = provider.generate_bluf(inc, [], [asset])
    assert "CRITICAL" in bluf.recommended_priority or bluf.recommended_priority == "CRITICAL"
    assert len(bluf.recommended_actions) > 0
    assert "dc-primary.mil.net" in bluf.bottom_line or "ASSET-104" in bluf.bottom_line
