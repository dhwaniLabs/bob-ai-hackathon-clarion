from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(String, primary_key=True, index=True) # e.g. CAM-001
    name = Column(String, nullable=False, index=True) # e.g. Operation Nightfall
    status = Column(String, default="ACTIVE") # ACTIVE, CONTAINED, MONITORING, RESOLVED
    threat_actor = Column(String, default="Unknown Advanced Threat Actor")
    risk_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    description = Column(Text, nullable=True)
    is_synthetic = Column(Boolean, default=False)
    
    incidents = relationship("Incident", back_populates="campaign")
