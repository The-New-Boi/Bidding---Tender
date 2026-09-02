from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update
from typing import List, Dict, Any, Optional
from datetime import datetime
import random

from backend.database import get_db
from backend.models.tender import Tender
from backend.models.bidder import Bidder
from backend.models.audit_log import AuditLog
from backend.schemas import (
    TenderCreate, TenderResponse, BidderResponse, BidderCreate, SelectWinnerRequest
)

router = APIRouter(prefix="/api/tenders", tags=["Tenders Pipeline"])

@router.get("", response_model=List[TenderResponse])
async def list_tenders(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import case
    status_priority = case(
        {"open": 1, "evaluation": 2, "awarded": 3},
        value=Tender.status,
        else_=4
    )
    result = await db.execute(select(Tender).order_by(status_priority, Tender.id.desc()))
    tenders = result.scalars().all()
    
    response = []
    for t in tenders:
        b_count = await db.scalar(
            select(func.count(Bidder.id)).where(Bidder.tender_id == t.id)
        )
        t_dict = TenderResponse.model_validate(t)
        t_dict.bidders_count = b_count or 0
        response.append(t_dict)
        
    return response

@router.post("", response_model=TenderResponse)
async def create_tender(t_in: TenderCreate, db: AsyncSession = Depends(get_db)):
    # Check if tender_number exists
    existing = await db.execute(select(Tender).where(Tender.tender_number == t_in.tender_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Tender number already exists")
        
    tender = Tender(
        tender_number=t_in.tender_number,
        title=t_in.title,
        description=t_in.description,
        department=t_in.department or "Refinery Procurement",
        budget=t_in.budget,
        category=t_in.category or "General",
        eligibility_criteria=t_in.eligibility_criteria,
        selection_mode=t_in.selection_mode or "ai_ranked",
        status="open",
        created_by="Ananya Rao",
        deadline=t_in.deadline
    )
    db.add(tender)
    await db.commit()
    await db.refresh(tender)
    
    # Audit log
    audit = AuditLog(
        action="Tender Created",
        entity_type="Tender",
        entity_id=str(tender.id),
        user="Ananya Rao",
        details=f"Created tender {tender.tender_number}: {tender.title} with budget {tender.budget}"
    )
    db.add(audit)
    await db.commit()
    
    res = TenderResponse.model_validate(tender)
    res.bidders_count = 0
    return res

@router.get("/{tender_id}", response_model=TenderResponse)
async def get_tender_detail(tender_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    b_count = await db.scalar(
        select(func.count(Bidder.id)).where(Bidder.tender_id == tender_id)
    )
    res = TenderResponse.model_validate(tender)
    res.bidders_count = b_count or 0
    return res

@router.get("/{tender_id}/bidders", response_model=List[BidderResponse])
async def get_tender_bidders(tender_id: int, stage: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Bidder).where(Bidder.tender_id == tender_id)
    if stage:
        query = query.where(Bidder.stage == stage)
    query = query.order_by(Bidder.final_score.desc(), Bidder.created_at.asc())
    
    result = await db.execute(query)
    bidders = result.scalars().all()
    return bidders

@router.post("/{tender_id}/register-bidder", response_model=BidderResponse)
async def register_bidder_for_tender(tender_id: int, bidder_in: BidderCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    bidder = Bidder(
        tender_id=tender_id,
        tender_ref=tender.tender_number,
        bidder_name=bidder_in.bidder_name,
        pan=bidder_in.pan,
        gstin=bidder_in.gstin,
        bid_amount=bidder_in.bid_amount,
        phone=bidder_in.phone,
        email=bidder_in.email,
        address=bidder_in.address,
        msme_registered=bidder_in.msme_registered or False,
        udyam_number=bidder_in.udyam_number,
        startup_india=bidder_in.startup_india or False,
        nsic_registered=bidder_in.nsic_registered or False,
        make_in_india=bidder_in.make_in_india if bidder_in.make_in_india is not None else True,
        local_content_percentage=bidder_in.local_content_percentage or 50,
        oem_authorized=bidder_in.oem_authorized or False,
        legacy_score=bidder_in.legacy_score or 75.0,
        gst_status="Active",
        pan_status="Verified",
        epfo_compliant=True,
        esic_compliant=True,
        mca21_status="Active",
        digilocker_verified=True,
        blacklisted=False,
        stage="registered"
    )
    db.add(bidder)
    await db.commit()
    await db.refresh(bidder)
    
    # Audit log
    audit = AuditLog(
        action="Bidder Registered",
        entity_type="Bidder",
        entity_id=str(bidder.id),
        user="System/Company",
        details=f"{bidder.bidder_name} registered for tender {tender.tender_number} with bid {bidder.bid_amount}"
    )
    db.add(audit)
    await db.commit()
    
    return bidder

# --- PIPELINE STAGE 2: ELIGIBILITY CHECK ---
@router.post("/{tender_id}/check-eligibility")
async def run_eligibility_filter(tender_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    bidders_res = await db.execute(select(Bidder).where(Bidder.tender_id == tender_id))
    bidders = bidders_res.scalars().all()
    
    criteria = tender.eligibility_criteria or {}
    require_msme = criteria.get("require_msme", False)
    min_local_content = criteria.get("min_local_content", 0)
    require_oem = criteria.get("require_oem", False)
    max_bid = criteria.get("max_bid_amount", 0)
    if max_bid == 0 and tender.budget > 0:
        max_bid = tender.budget * 1.1 # Allow up to 10% over budget
        
    eligible_count = 0
    eliminated_count = 0
    
    for b in bidders:
        reasons = []
        if b.blacklisted:
            reasons.append("Company is blacklisted")
        if b.gst_status != "Active":
            reasons.append(f"GST status is {b.gst_status}")
        if b.pan_status != "Verified":
            reasons.append("PAN is unverified")
        if require_msme and not b.msme_registered:
            reasons.append("MSME registration required but missing")
        if require_oem and not b.oem_authorized:
            reasons.append("OEM authorization required but missing")
        if min_local_content > 0 and b.local_content_percentage < min_local_content:
            reasons.append(f"Local content ({b.local_content_percentage}%) below requirement ({min_local_content}%)")
        if max_bid > 0 and b.bid_amount > max_bid:
            reasons.append(f"Bid amount ({b.bid_amount}) exceeds max threshold ({max_bid})")
            
        if reasons:
            b.stage = "eliminated"
            b.elimination_reason = " | ".join(reasons)
            eliminated_count += 1
        else:
            b.stage = "eligible"
            b.elimination_reason = None
            eligible_count += 1
            
    tender.status = "evaluation"
    await db.commit()
    
    audit = AuditLog(
        action="Eligibility Check Executed",
        entity_type="Tender",
        entity_id=str(tender.id),
        user="Ananya Rao",
        details=f"Evaluated {len(bidders)} bidders: {eligible_count} Passed, {eliminated_count} Eliminated"
    )
    db.add(audit)
    await db.commit()
    
    return {
        "message": "Eligibility check complete",
        "total_bidders": len(bidders),
        "eligible": eligible_count,
        "eliminated": eliminated_count
    }

# --- PIPELINE STAGE 3: AI SCORING & RANKING ---
@router.post("/{tender_id}/score-bidders")
async def run_ai_scoring(tender_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    bidders_res = await db.execute(
        select(Bidder).where(Bidder.tender_id == tender_id, Bidder.stage == "eligible")
    )
    eligible_bidders = bidders_res.scalars().all()
    
    if not eligible_bidders:
        return {"message": "No eligible bidders found to score."}
        
    # Calculate scores for eligible bidders
    scored_list = []
    for b in eligible_bidders:
        # Compliance score calculation (0-100)
        c_score = 100.0
        if not b.epfo_compliant: c_score -= 15
        if not b.esic_compliant: c_score -= 15
        if not b.digilocker_verified: c_score -= 10
        if not b.startup_india and not b.msme_registered: c_score -= 5
        
        b.compliance_score = max(0.0, round(c_score, 1))
        
        # Financial score based on bid competitiveness vs tender budget
        bid_factor = 100.0
        if tender.budget > 0:
            ratio = b.bid_amount / tender.budget
            if ratio <= 0.9: bid_factor = 100.0
            elif ratio <= 1.0: bid_factor = 95.0
            elif ratio <= 1.05: bid_factor = 85.0
            else: bid_factor = 70.0
            
        # Final Score: 40% Compliance + 40% Legacy Record + 20% Bid Factor
        final = (b.compliance_score * 0.40) + ((b.legacy_score or 75.0) * 0.40) + (bid_factor * 0.20)
        b.final_score = round(final, 1)
        b.stage = "scored"
        scored_list.append(b)
        
    # Rank bidders by final_score descending
    scored_list.sort(key=lambda x: x.final_score, reverse=True)
    for index, b in enumerate(scored_list):
        b.rank = index + 1
        
    await db.commit()
    
    audit = AuditLog(
        action="AI Scoring & Ranking Executed",
        entity_type="Tender",
        entity_id=str(tender.id),
        user="AI Compliance Engine",
        details=f"Scored {len(scored_list)} eligible bidders. Top rank: {scored_list[0].bidder_name} (Score: {scored_list[0].final_score})"
    )
    db.add(audit)
    await db.commit()
    
    return {
        "message": "AI Scoring complete",
        "scored_count": len(scored_list),
        "top_bidder": scored_list[0].bidder_name if scored_list else None
    }

# --- PIPELINE STAGE 4 & 5: WINNER SELECTION ---
@router.post("/{tender_id}/select-winner")
async def select_tender_winner(tender_id: int, req: SelectWinnerRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    bidders_res = await db.execute(
        select(Bidder).where(Bidder.tender_id == tender_id, Bidder.stage == "scored")
    )
    scored_bidders = bidders_res.scalars().all()
    
    if not scored_bidders:
        # Try finding eligible bidders if scoring wasn't run yet
        bidders_res = await db.execute(
            select(Bidder).where(Bidder.tender_id == tender_id, Bidder.stage == "eligible")
        )
        scored_bidders = bidders_res.scalars().all()
        
    if not scored_bidders:
        raise HTTPException(status_code=400, detail="No qualified bidders available to select a winner.")
        
    mode = req.mode or tender.selection_mode or "ai_ranked"
    winner = None
    reason = ""
    
    if req.bidder_id:
        # Officer manually selected specific bidder
        winner = next((b for b in scored_bidders if b.id == req.bidder_id), None)
        reason = f"Manual selection by procurement officer Ananya Rao."
    elif mode == "fair_draw":
        # Anti-Corruption Fair Draw: Random pick among top 3 qualified bidders
        top_candidates = sorted(scored_bidders, key=lambda x: x.final_score, reverse=True)[:3]
        winner = random.choice(top_candidates)
        reason = f"Selected via Fair Trade Anti-Corruption Random Draw among Top {len(top_candidates)} qualified bidders."
    else:
        # AI Ranked: Top score wins
        scored_bidders.sort(key=lambda x: x.final_score, reverse=True)
        winner = scored_bidders[0]
        reason = f"Selected by AI Evaluation System based on highest combined score ({winner.final_score}/100)."
        
    if not winner:
        raise HTTPException(status_code=404, detail="Selected bidder not found")
        
    # Mark winner
    for b in scored_bidders:
        if b.id == winner.id:
            b.stage = "selected"
        else:
            b.stage = "scored"
            
    tender.awarded_bidder_id = winner.id
    tender.awarded_reason = reason
    tender.status = "awarded"
    
    await db.commit()
    
    audit = AuditLog(
        action="Tender Awarded",
        entity_type="Tender",
        entity_id=str(tender.id),
        user="Ananya Rao",
        details=f"Awarded Tender #{tender.tender_number} to {winner.bidder_name} ({reason})"
    )
    db.add(audit)
    await db.commit()
    
    return {
        "message": "Tender awarded successfully",
        "tender_id": tender.id,
        "winner_id": winner.id,
        "winner_name": winner.bidder_name,
        "selection_mode": mode,
        "reason": reason
    }
