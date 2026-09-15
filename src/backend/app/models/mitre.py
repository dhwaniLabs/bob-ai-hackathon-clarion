from sqlalchemy import Column, String, Text
from app.database.session import Base

class MitreTechnique(Base):
    __tablename__ = "mitre_techniques"
    
    id = Column(String, primary_key=True, index=True) # e.g. T1003
    tactic = Column(String, nullable=False, index=True) # e.g. Credential Access
    name = Column(String, nullable=False) # e.g. OS Credential Dumping
    subtechnique_of = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    detection_guidance = Column(Text, nullable=True)
    severity_hint = Column(String, default="HIGH")
