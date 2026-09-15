from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from app.database.session import Base

class Indicator(Base):
    __tablename__ = "indicators"
    
    id = Column(String, primary_key=True, index=True) # e.g. IOC-001
    indicator_type = Column(String, nullable=False, index=True) # IP, DOMAIN, HASH_SHA256, URL
    value = Column(String, nullable=False, index=True)
    threat_actor = Column(String, nullable=True)
    source = Column(String, nullable=False) # e.g. US-CYBERCOM Feed, Mandiant Intelligence
    confidence = Column(Integer, default=85) # 0-100
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    tags = Column(String, default="c2,apt,malicious")
    is_active = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
