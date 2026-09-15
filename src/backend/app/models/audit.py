from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user = Column(String, default="analyst_lead")
    action = Column(String, nullable=False, index=True) # CONFIRM_THREAT, MARK_FALSE_POSITIVE, ESCALATE, DISMISS, ASSIGN, INGEST_ALERTS, GENERATE_BLUF, GENERATE_DEMO
    target_type = Column(String, nullable=False) # INCIDENT, CAMPAIGN, ALERT, SYSTEM
    target_id = Column(String, nullable=False)
    details = Column(Text, default="")
