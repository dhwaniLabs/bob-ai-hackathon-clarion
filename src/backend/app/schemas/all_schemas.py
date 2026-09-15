from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# --- Alert Schemas ---
class AlertBase(BaseModel):
    id: Optional[str] = None
    timestamp: Optional[datetime] = None
    source: str # SIEM, Firewall, IDS, Endpoint, Intelligence Report, Satellite Feed, Network Sensor
    source_type: str # authentication, process_execution, network_flow, scada_telemetry, etc.
    event_type: str # suspicious_login, powershell_execution, privilege_escalation, beaconing, etc.
    severity: str # critical, high, medium, low, info
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    user: Optional[str] = None
    hostname: Optional[str] = None
    asset_id: Optional[str] = None
    description: str
    raw_data: Optional[Dict[str, Any]] = None
    mitre_technique_id: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    timestamp: datetime
    source: str
    source_type: str
    event_type: str
    severity: str
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    user: Optional[str] = None
    hostname: Optional[str] = None
    asset_id: Optional[str] = None
    description: str
    raw_data: Optional[str] = None
    incident_id: Optional[str] = None
    mitre_technique_id: Optional[str] = None
    is_synthetic: bool = False

class IngestionStats(BaseModel):
    records_received: int
    valid_records: int
    invalid_records: int
    duplicates: int
    new_alerts: int
    details: Optional[str] = None

# --- Scoring & MITRE Breakdown ---
class ScoreBreakdown(BaseModel):
    severity: float = Field(..., description="0-25 pts: Max and avg alert severity")
    asset_criticality: float = Field(..., description="0-25 pts: Targeted asset tier")
    correlation: float = Field(..., description="0-20 pts: Multi-INT cross-feed corroboration")
    confidence: float = Field(..., description="0-20 pts: Sensor confidence & historical accuracy")
    impact: float = Field(..., description="0-10 pts: Kill-chain progression depth")
    total: float = Field(..., description="0-100 pts overall priority risk score")

class MitreMappingItem(BaseModel):
    tactic: str
    technique_id: str
    technique_name: str
    confidence: int # percentage 0-100
    evidence: str
    is_suspected: bool = False

# --- Incident Schemas ---
class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    status: str
    priority: str
    risk_score: float
    confidence: float
    campaign_id: Optional[str] = None
    assigned_analyst: str
    first_seen: datetime
    last_seen: datetime
    affected_assets_count: int
    alerts_count: int
    score_breakdown: Optional[Dict[str, Any]] = None
    correlation_explanation: Optional[List[str]] = None
    mitre_mappings: Optional[List[Dict[str, Any]]] = None
    bluf_summary: Optional[str] = None
    is_synthetic: bool = False

class IncidentDetailResponse(IncidentResponse):
    alerts: List[AlertResponse] = []
    investigation_notes: List[Dict[str, Any]] = []
    false_positive_reason: Optional[str] = None

class IncidentActionRequest(BaseModel):
    action: str # confirm, false_positive, escalate, dismiss, assign, add_note
    reason: Optional[str] = None
    analyst: Optional[str] = None
    note: Optional[str] = None

class BLUFResponse(BaseModel):
    incident_id: str
    bottom_line: str
    what_happened: str
    why_it_matters: str
    affected_assets: List[str]
    confidence_level: str # Almost Certainly, Likely, Roughly Even Chance, Unlikely
    relevant_mitre_techniques: List[str]
    recommended_priority: str
    recommended_actions: List[str]
    ai_provider: str # IBM watsonx.ai or DEMO AI FALLBACK

# --- Campaign Schemas ---
class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    status: str
    threat_actor: str
    risk_score: float
    confidence: float
    first_seen: datetime
    last_seen: datetime
    description: Optional[str] = None
    alerts_count: int = 0
    assets_count: int = 0
    mitre_techniques: List[str] = []
    is_synthetic: bool = False

class CampaignDetailResponse(CampaignResponse):
    incidents: List[IncidentResponse] = []

# --- Asset Schemas ---
class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    hostname: str
    type: str
    criticality: str
    owner: str
    location: str
    ip_address: str
    status: str
    current_risk: float
    created_at: datetime
    updated_at: datetime
    incident_count: int = 0

# --- Threat Intel / Indicator Schemas ---
class IndicatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    indicator_type: str
    value: str
    threat_actor: Optional[str] = None
    source: str
    confidence: int
    first_seen: datetime
    last_seen: datetime
    tags: str
    is_active: bool
    description: Optional[str] = None

# --- MITRE Schemas ---
class MitreTechniqueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    tactic: str
    name: str
    subtechnique_of: Optional[str] = None
    description: str
    detection_guidance: Optional[str] = None
    severity_hint: str
    observed_count: int = 0

# --- Report Schemas ---
class ReportCreateRequest(BaseModel):
    title: str
    report_type: str # INCIDENT, BLUF, DAILY_SUMMARY, MITRE_SUMMARY, ANALYST_INVESTIGATION
    incident_id: Optional[str] = None
    notes: Optional[str] = None

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    report_type: str
    incident_id: Optional[str] = None
    generated_by: str
    created_at: datetime
    summary: str
    content_html: str


# --- Dashboard Schemas ---
class DashboardKPICards(BaseModel):
    critical_threats: int
    high_priority: int
    total_alerts: int
    correlated_incidents: int
    false_positive_rate: float
    affected_assets: int

class DashboardResponse(BaseModel):
    kpis: DashboardKPICards
    severity_distribution: List[Dict[str, Any]]
    alerts_over_time: List[Dict[str, Any]]
    threat_sources: List[Dict[str, Any]]
    mitre_technique_distribution: List[Dict[str, Any]]
    threat_risk_trend: List[Dict[str, Any]]
    top_affected_assets: List[Dict[str, Any]]
    active_threats: List[Dict[str, Any]]

# --- AI Schemas ---
class AIChatRequest(BaseModel):
    prompt: str
    incident_id: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str
    ai_mode: str
    model_id: str
    sources_cited: List[str] = []

class AIStatusResponse(BaseModel):
    mode: str # DEMO or WATSONX
    configured: bool
    model_id: str
    url: str
    status_message: str

# --- System Health ---
class ComponentHealth(BaseModel):
    name: str
    status: str # ONLINE, DEGRADED, OFFLINE
    latency_ms: Optional[float] = None
    details: str

class SystemHealthResponse(BaseModel):
    system_status: str # HEALTHY, DEGRADED, CRITICAL
    database: ComponentHealth
    api: ComponentHealth
    ai_engine: ComponentHealth
    correlation_engine: ComponentHealth
    mitre_knowledge: ComponentHealth
    ingestion_pipeline: ComponentHealth
    uptime_seconds: float
    last_processed_event: Optional[datetime] = None
    total_alerts_processed: int
