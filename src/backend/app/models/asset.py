from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(String, primary_key=True, index=True) # e.g. ASSET-104
    hostname = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False) # e.g. Command Server, Domain Controller
    criticality = Column(String, nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    owner = Column(String, nullable=False)
    location = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    status = Column(String, default="OPERATIONAL") # OPERATIONAL, DEGRADED, COMPROMISED, INVESTIGATING
    current_risk = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
