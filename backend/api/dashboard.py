from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any, List

from backend.database import get_db
from backend.models.bidder import Bidder
from backend.models.verification import VerificationRun

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    bidders_count = await db.scalar(select(func.count(Bidder.id)))
    return {
        "total_bidders": bidders_count or 0,
        "verified": 0,
        "flagged": 0,
        "pending": 0,
        "average_score": 0.0
    }

@router.get("/risk-distribution")
async def get_risk_distribution(db: AsyncSession = Depends(get_db)) -> Dict[str, int]:
    return {
        "Low": 0,
        "Medium": 0,
        "High": 0,
        "Critical": 0
    }

@router.get("/recent")
async def get_recent_verifications(db: AsyncSession = Depends(get_db)) -> List[Dict[str, Any]]:
    return []

@router.get("/compliance-summary")
async def get_compliance_summary(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return {
        "GST": {"pass": 0, "fail": 0},
        "PAN": {"pass": 0, "fail": 0},
    }
