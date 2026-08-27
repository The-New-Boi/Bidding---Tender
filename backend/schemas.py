from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "officer"
    department: Optional[str] = "Procurement"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Tender Schemas ---
class TenderCreate(BaseModel):
    tender_number: str
    title: str
    description: Optional[str] = ""
    department: Optional[str] = "Refinery Procurement"
    budget: float
    category: Optional[str] = "General"
    selection_mode: Optional[str] = "ai_ranked" # 'ai_ranked' or 'fair_draw'
    eligibility_criteria: Optional[Dict[str, Any]] = {
        "require_msme": False,
        "min_local_content": 20,
        "require_oem": False,
        "max_bid_amount": 0
    }
    deadline: Optional[datetime] = None

class TenderResponse(BaseModel):
    id: int
    tender_number: str
    title: str
    description: Optional[str] = None
    department: str
    budget: float
    category: str
    eligibility_criteria: Optional[Dict[str, Any]] = None
    selection_mode: str
    status: str
    awarded_bidder_id: Optional[int] = None
    awarded_reason: Optional[str] = None
    created_by: str
    deadline: Optional[datetime] = None
    created_at: datetime
    bidders_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --- Bidder Schemas ---
class BidderCreate(BaseModel):
    tender_id: Optional[int] = None
    tender_ref: Optional[str] = "TENDER-2026-001"
    bidder_name: str
    pan: str
    gstin: str
    bid_amount: float
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    msme_registered: Optional[bool] = False
    udyam_number: Optional[str] = None
    startup_india: Optional[bool] = False
    nsic_registered: Optional[bool] = False
    make_in_india: Optional[bool] = True
    local_content_percentage: Optional[int] = 50
    oem_authorized: Optional[bool] = False
    legacy_score: Optional[float] = 75.0

class BidderResponse(BaseModel):
    id: int
    tender_id: Optional[int] = None
    tender_ref: Optional[str] = None
    bidder_name: str
    pan: str
    gstin: str
    bid_amount: float
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    msme_registered: bool
    udyam_number: Optional[str] = None
    gst_status: str
    pan_status: str
    startup_india: bool
    nsic_registered: bool
    epfo_compliant: bool
    esic_compliant: bool
    make_in_india: bool
    local_content_percentage: int
    oem_authorized: bool
    mca21_cin: Optional[str] = None
    mca21_status: Optional[str] = None
    digilocker_verified: bool
    blacklisted: bool
    blacklist_reason: Optional[str] = None
    
    stage: str
    elimination_reason: Optional[str] = None
    compliance_score: float
    legacy_score: float
    final_score: float
    rank: Optional[int] = None
    
    created_at: datetime

    class Config:
        from_attributes = True

# --- Pipeline Request Schemas ---
class SelectWinnerRequest(BaseModel):
    bidder_id: Optional[int] = None
    mode: Optional[str] = "ai_ranked" # 'ai_ranked' or 'fair_draw'

# --- Audit & Compliance Schemas ---
class ComplianceCheckResponse(BaseModel):
    id: int
    category: str
    source_portal: str
    status: str
    score: float
    weight: float
    details: str
    portal_response: Optional[str] = None
    discrepancies: Optional[str] = None
    checked_at: datetime

    class Config:
        from_attributes = True

class VerificationRunResponse(BaseModel):
    id: int
    bidder_id: int
    overall_score: float
    risk_level: str
    status: str
    ai_recommendation: Optional[str] = None
    ai_gaps_detected: Optional[str] = None
    verified_by: str
    officer_decision: Optional[str] = None
    officer_remarks: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    checks: List[ComplianceCheckResponse] = []

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    action: str
    entity_type: str
    entity_id: str
    user: str
    category: Optional[str] = None
    details: str
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True

class OfficerDecision(BaseModel):
    decision: str
    remarks: Optional[str] = None

class BulkVerificationRequest(BaseModel):
    bidder_ids: List[int]
