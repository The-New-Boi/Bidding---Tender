from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import pandas as pd
import bcrypt
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any, List, Optional

from backend.config import settings
from backend.database import init_db, AsyncSessionLocal, get_db
from backend.models.bidder import Bidder
from backend.models.tender import Tender
from backend.models.user import User
from backend.models.audit_log import AuditLog
from backend.schemas import AuditLogResponse
from backend.api import bidders, verification, dashboard, audit, auth, tenders

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

async def load_sample_data():
    async with AsyncSessionLocal() as session:
        # 1. Seed Default Officer User if not present
        user_res = await session.execute(select(User).limit(1))
        if user_res.scalar_one_or_none() is None:
            default_user = User(
                name="Ananya Rao",
                email="ananya@cpcl.gov.in",
                hashed_password=hash_password("admin123"),
                role="officer",
                department="CPCL Procurement"
            )
            session.add(default_user)
            await session.commit()
            print("Seeded default user Ananya Rao.")

        # 2. Seed Default Tender if not present
        tender_res = await session.execute(select(Tender).limit(1))
        tender = tender_res.scalar_one_or_none()
        if tender is None:
            tender = Tender(
                tender_number="TENDER-2026-CPCL-001",
                title="Procurement of Refinery Instrumentation Valves & Flow Controllers",
                description="High-precision industrial control valves, flow meters and compliance instrumentation for CPCL Chennai Refinery Unit 4.",
                department="CPCL Chennai Refinery",
                budget=5500000.0, # 55 Lakhs
                category="Instrumentation & Controls",
                eligibility_criteria={
                    "require_msme": True,
                    "min_local_content": 40,
                    "require_oem": True,
                    "max_bid_amount": 6000000
                },
                selection_mode="ai_ranked",
                status="open",
                created_by="Ananya Rao"
            )
            session.add(tender)
            await session.commit()
            await session.refresh(tender)
            print(f"Seeded default tender ID {tender.id}")

        # 3. Seed Bidders attached to this tender
        bidder_check = await session.execute(select(Bidder).limit(1))
        if bidder_check.scalar_one_or_none() is None:
            sample_bidders = [
                {
                    "bidder_name": "Kaveri Industrial Supplies Ltd",
                    "pan": "AAACK1234F",
                    "gstin": "33AAACK1234F1Z5",
                    "bid_amount": 4850000.0,
                    "phone": "+91 98401 23456",
                    "email": "contact@kaveriind.com",
                    "address": "Chennai, Tamil Nadu",
                    "msme_registered": True,
                    "udyam_number": "UDYAM-TN-02-0012345",
                    "local_content_percentage": 65,
                    "oem_authorized": True,
                    "legacy_score": 88.0,
                    "blacklisted": False
                },
                {
                    "bidder_name": "Marina Automation Works Pvt Ltd",
                    "pan": "AABCM5678G",
                    "gstin": "33AABCM5678G1Z2",
                    "bid_amount": 5100000.0,
                    "phone": "+91 94440 98765",
                    "email": "info@marinaauto.in",
                    "address": "Coimbatore, Tamil Nadu",
                    "msme_registered": True,
                    "udyam_number": "UDYAM-TN-03-0098765",
                    "local_content_percentage": 50,
                    "oem_authorized": True,
                    "legacy_score": 82.0,
                    "blacklisted": False
                },
                {
                    "bidder_name": "Reliance Industrial Controls",
                    "pan": "AABCR1122K",
                    "gstin": "27AABCR1122K1Z9",
                    "bid_amount": 4400000.0,
                    "phone": "+91 98200 11223",
                    "email": "tenders@reliance.com",
                    "address": "Mumbai, Maharashtra",
                    "msme_registered": False,
                    "local_content_percentage": 80,
                    "oem_authorized": True,
                    "legacy_score": 95.0,
                    "blacklisted": False
                },
                {
                    "bidder_name": "Adani Enterprises Infra",
                    "pan": "AABCA9988P",
                    "gstin": "24AABCA9988P1Z3",
                    "bid_amount": 6200000.0, # Exceeds budget
                    "phone": "+91 97129 99887",
                    "email": "bids@adani.com",
                    "address": "Ahmedabad, Gujarat",
                    "msme_registered": False,
                    "local_content_percentage": 25, # Below local content requirement
                    "oem_authorized": False,
                    "legacy_score": 60.0,
                    "blacklisted": True,
                    "blacklist_reason": "Failure to complete 2024 refinery piping contract on schedule."
                }
            ]
            for b_data in sample_bidders:
                bidder = Bidder(
                    tender_id=tender.id,
                    tender_ref=tender.tender_number,
                    bidder_name=b_data["bidder_name"],
                    pan=b_data["pan"],
                    gstin=b_data["gstin"],
                    bid_amount=b_data["bid_amount"],
                    phone=b_data["phone"],
                    email=b_data["email"],
                    address=b_data["address"],
                    msme_registered=b_data["msme_registered"],
                    udyam_number=b_data.get("udyam_number"),
                    local_content_percentage=b_data["local_content_percentage"],
                    oem_authorized=b_data["oem_authorized"],
                    legacy_score=b_data["legacy_score"],
                    blacklisted=b_data["blacklisted"],
                    blacklist_reason=b_data.get("blacklist_reason"),
                    gst_status="Active" if not b_data["blacklisted"] else "Suspended",
                    pan_status="Verified",
                    epfo_compliant=True,
                    esic_compliant=True,
                    mca21_status="Active",
                    digilocker_verified=True,
                    stage="registered"
                )
                session.add(bidder)
            await session.commit()
            print("Seeded 4 sample bidders.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await init_db()
    await load_sample_data()
    yield
    # Shutdown
    pass

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for GeM Bid & Tender Compliance AI Platform",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tenders.router)
app.include_router(bidders.router)
app.include_router(verification.router)
app.include_router(dashboard.router)
app.include_router(audit.router)

# ---------------------------------------------------------------------------
# Shortcut aliases expected by frontend
# ---------------------------------------------------------------------------

@app.get("/api/stats", tags=["Shortcuts"])
async def get_stats_alias(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    bidders_count = await db.scalar(select(func.count(Bidder.id))) or 0
    tenders_count = await db.scalar(select(func.count(Tender.id))) or 0
    verified = await db.scalar(
        select(func.count(Bidder.id)).where(Bidder.gst_status == "Active")
    ) or 0
    high_risk = await db.scalar(
        select(func.count(Bidder.id)).where(Bidder.blacklisted == True)
    ) or 0
    needs_review = max(0, bidders_count - verified - high_risk)
    return {
        "total_bidders": bidders_count,
        "total_tenders": tenders_count,
        "verified": verified,
        "needs_review": needs_review,
        "high_risk": high_risk,
        "flagged": high_risk,
        "pending": needs_review,
        "average_score": 84.5,
    }

@app.get("/api/audit-logs", tags=["Shortcuts"])
async def get_audit_logs_alias(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> List[AuditLogResponse]:
    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action == action)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    query = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
