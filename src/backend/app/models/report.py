from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from app.database.session import Base

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, index=True) # e.g. REP-101
    title = Column(String, nullable=False)
    report_type = Column(String, nullable=False, index=True) # INCIDENT, BLUF, DAILY_SUMMARY, MITRE_SUMMARY, ANALYST_INVESTIGATION
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    generated_by = Column(String, default="Analyst / Clarion Core")
    created_at = Column(DateTime, default=datetime.utcnow)
    content_html = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
