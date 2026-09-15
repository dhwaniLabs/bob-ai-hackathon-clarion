from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, index=True) # e.g. ALT-1001
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String, nullable=False, index=True) # SIEM, Firewall, IDS, Endpoint, Intelligence Report, Satellite Feed, Network Sensor
    source_type = Column(String, nullable=False, index=True) # authentication, process_execution, network_flow, scada_telemetry, etc.
    event_type = Column(String, nullable=False, index=True) # suspicious_login, powershell_execution, privilege_escalation, beaconing, etc.
    severity = Column(String, nullable=False, index=True) # critical, high, medium, low, info
    src_ip = Column(String, nullable=True, index=True)
    dst_ip = Column(String, nullable=True, index=True)
    user = Column(String, nullable=True, index=True)
    hostname = Column(String, nullable=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=True, index=True)
    description = Column(Text, nullable=False)
    raw_data = Column(Text, default="{}")
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True, index=True)
    mitre_technique_id = Column(String, ForeignKey("mitre_techniques.id"), nullable=True)
    is_synthetic = Column(Boolean, default=False)
    
    incident = relationship("Incident", back_populates="alerts")
