from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from backend.database import get_db
from backend.models.bidder import Bidder
from backend.schemas import BidderResponse, BidderCreate

router = APIRouter(prefix="/api/bidders", tags=["Bidders"])

@router.get("", response_model=List[BidderResponse])
async def list_bidders(
    skip: int = 0,
    limit: int = 100,
    tender_id: Optional[int] = None,
    stage: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Bidder)
    if tender_id:
        query = query.where(Bidder.tender_id == tender_id)
    if stage:
        query = query.where(Bidder.stage == stage)
    query = query.order_by(Bidder.id.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{bidder_id}", response_model=BidderResponse)
async def get_bidder(bidder_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bidder).where(Bidder.id == bidder_id))
    bidder = result.scalar_one_or_none()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")
    return bidder
