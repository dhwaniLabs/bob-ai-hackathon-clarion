from fastapi import APIRouter
from app.api.endpoints import (
    dashboard,
    alerts,
    incidents,
    campaigns,
    assets,
    mitre,
    threat_intel,
    analytics,
    reports,
    ai_assistant,
    demo,
    system_health
)

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["Incidents"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["Threat Campaigns"])
api_router.include_router(assets.router, prefix="/assets", tags=["Assets"])
api_router.include_router(mitre.router, prefix="/mitre", tags=["MITRE ATT&CK"])
api_router.include_router(threat_intel.router, prefix="/threat-intelligence", tags=["Threat Intelligence"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(ai_assistant.router, prefix="/ai", tags=["AI Assistant"])
api_router.include_router(demo.router, prefix="/demo", tags=["Demo Mode"])
api_router.include_router(system_health.router, prefix="/system-health", tags=["System Health"])
