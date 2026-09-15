from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(String, primary_key=True, index=True) # e.g. INC-001
    title = Column(String, nullable=False, index=True)
    status = Column(String, default="ACTIVE", index=True) # ACTIVE, CONFIRMED, FALSE_POSITIVE, ESCALATED, RESOLVED, DISMISSED
    priority = Column(String, default="HIGH", index=True) # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Float, default=0.0) # 0-100
    confidence = Column(Float, default=80.0) # 0-100
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=True)
    assigned_analyst = Column(String, default="Unassigned")
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    affected_assets_count = Column(Integer, default=1)
    alerts_count = Column(Integer, default=1)
    
    # Explainable correlation & scoring breakdowns (stored as structured JSON)
    score_breakdown = Column(Text, nullable=True)
    correlation_explanation = Column(Text, nullable=True)
    mitre_mappings = Column(Text, nullable=True)
    
    # AI BLUF briefing
    bluf_summary = Column(Text, nullable=True)
    bluf_metadata = Column(Text, nullable=True)
    
    # Analyst workflows
    investigation_notes = Column(Text, default="[]")
    false_positive_reason = Column(Text, nullable=True)
    
    is_synthetic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    campaign = relationship("Campaign", back_populates="incidents")
    alerts = relationship("Alert", back_populates="incident")
