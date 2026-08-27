from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base

class Bidder(Base):
    __tablename__ = "bidders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_id = Column(Integer, ForeignKey("tenders.id", ondelete="CASCADE"), nullable=True)
    tender_ref = Column(String, index=True, nullable=True) # e.g. TENDER-2026-001
    bidder_name = Column(String, index=True)
    pan = Column(String, index=True)
    gstin = Column(String, index=True)
    bid_amount = Column(Float, default=0.0)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    
    # Compliance & Credentials
    msme_registered = Column(Boolean, default=False)
    udyam_number = Column(String, nullable=True)
    gst_status = Column(String, default="Active")
    pan_status = Column(String, default="Verified")
    startup_india = Column(Boolean, default=False)
    nsic_registered = Column(Boolean, default=False)
    epfo_compliant = Column(Boolean, default=True)
    esic_compliant = Column(Boolean, default=True)
    make_in_india = Column(Boolean, default=True)
    local_content_percentage = Column(Integer, default=50)
    oem_authorized = Column(Boolean, default=False)
    mca21_cin = Column(String, nullable=True)
    mca21_status = Column(String, default="Active")
    digilocker_verified = Column(Boolean, default=False)
    blacklisted = Column(Boolean, default=False)
    blacklist_reason = Column(String, nullable=True)
    
    # Pipeline stages: registered -> eligible -> scored -> selected / eliminated
    stage = Column(String, default="registered")
    elimination_reason = Column(Text, nullable=True)
    
    # Evaluation Scores
    compliance_score = Column(Float, default=0.0) # Document & Portal score
    legacy_score = Column(Float, default=75.0)     # Past record & company size score
    final_score = Column(Float, default=0.0)      # Weighted total score
    rank = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    tender = relationship("Tender", back_populates="bidders")
