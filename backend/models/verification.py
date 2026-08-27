from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base
from sqlalchemy.sql import func

class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"))
    overall_score = Column(Float)
    risk_level = Column(String)  # Low/Medium/High/Critical
    status = Column(String)  # Pending/In Progress/Completed/Failed
    ai_recommendation = Column(Text, nullable=True)
    ai_gaps_detected = Column(Text, nullable=True)  # JSON stored as text
    verified_by = Column(String, default='system')
    officer_decision = Column(String, nullable=True)  # Qualified/Disqualified/Hold/Pending
    officer_remarks = Column(Text, nullable=True)
    started_at = Column(DateTime)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    checks = relationship("ComplianceCheck", back_populates="verification_run")


class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    verification_run_id = Column(Integer, ForeignKey("verification_runs.id"))
    category = Column(String)
    source_portal = Column(String)
    status = Column(String)  # Pass/Fail/Warning/Not Applicable/Pending
    score = Column(Float)
    weight = Column(Float)
    details = Column(Text)  # JSON stored as text
    portal_response = Column(Text, nullable=True)  # JSON stored as text
    discrepancies = Column(Text, nullable=True)
    checked_at = Column(DateTime)

    verification_run = relationship("VerificationRun", back_populates="checks")
