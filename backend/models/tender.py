from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base

class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String, default="Refinery Procurement")
    budget = Column(Float, default=0.0)
    category = Column(String, default="General")
    
    # Eligibility rules stored as JSON: e.g. {"require_msme": false, "min_local_content": 50, "require_oem": false, "min_legacy_score": 60}
    eligibility_criteria = Column(JSON, nullable=True)
    
    # Selection Mode: 'ai_ranked' (best score wins) or 'fair_draw' (random draw among top qualified)
    selection_mode = Column(String, default="ai_ranked")
    
    # Status: 'open', 'evaluation', 'closed', 'awarded'
    status = Column(String, default="open")
    
    awarded_bidder_id = Column(Integer, nullable=True)
    awarded_reason = Column(Text, nullable=True)
    
    created_by = Column(String, default="Ananya Rao")
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    bidders = relationship("Bidder", back_populates="tender", cascade="all, delete-orphan")
