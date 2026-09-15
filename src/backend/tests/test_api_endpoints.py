from fastapi.testclient import TestClient
from main import app
from app.database.session import Base, engine, SessionLocal
from app.database.seed_data import seed_database
import pytest

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    with TestClient(app) as c:
        yield c


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CLARION"
    assert data["status"] == "OPERATIONAL"

def test_dashboard_endpoint(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["critical_threats"] >= 1
    assert len(data["severity_distribution"]) > 0
    assert len(data["active_threats"]) > 0

def test_alerts_endpoint(client):
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)
    assert len(alerts) > 0

def test_incidents_endpoint(client):
    response = client.get("/api/incidents")
    assert response.status_code == 200
    incidents = response.json()
    assert len(incidents) > 0
    inc_id = incidents[0]["id"]
    
    # Test incident detail
    detail_res = client.get(f"/api/incidents/{inc_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == inc_id
    assert "score_breakdown" in detail

def test_demo_attack_generation(client):
    response = client.post("/api/demo/generate")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "INC-NIGHTFALL" in data["incident_id"]
    assert data["risk_score"] == 94.0

def test_ai_status_and_bluf(client):
    # AI Status
    status_res = client.get("/api/ai/status")
    assert status_res.status_code == 200
    assert status_res.json()["mode"] in ["DEMO", "WATSONX"]

    # Generate BLUF for INC-001
    bluf_res = client.post("/api/incidents/INC-001/bluf")
    assert bluf_res.status_code == 200
    bluf_data = bluf_res.json()
    assert "bottom_line" in bluf_data
    assert len(bluf_data["recommended_actions"]) > 0

def test_reports_generation(client):
    req_body = {
        "title": "Integration Test BLUF Report",
        "report_type": "BLUF",
        "incident_id": "INC-001"
    }
    response = client.post("/api/reports/generate", json=req_body)
    assert response.status_code == 200
    rep = response.json()
    assert rep["report_type"] == "BLUF"
    assert "content_html" in rep

def test_system_health(client):
    response = client.get("/api/system-health")
    assert response.status_code == 200
    health = response.json()
    assert health["system_status"] == "HEALTHY"
    assert health["database"]["status"] == "ONLINE"
    assert health["api"]["status"] == "ONLINE"

