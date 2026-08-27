from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from datetime import datetime

from backend.database import get_db
from backend.models.bidder import Bidder
from backend.models.verification import VerificationRun, ComplianceCheck
from backend.schemas import VerificationRunResponse, OfficerDecision, BulkVerificationRequest

router = APIRouter(prefix="/api/verify", tags=["Verification"])

from sqlalchemy.orm import selectinload

@router.post("/{bidder_id}", response_model=VerificationRunResponse)
async def verify_bidder(bidder_id: int, db: AsyncSession = Depends(get_db)):
    # Check if bidder exists
    result = await db.execute(select(Bidder).where(Bidder.id == bidder_id))
    bidder = result.scalar_one_or_none()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")
        
    # Convert SQLAlchemy model to dict for orchestrator
    bidder_dict = {
        "id": bidder.id,
        "name": bidder.bidder_name,
        "pan": bidder.pan,
        "gstin": bidder.gstin,
        "udyam_number": bidder.udyam_number,
        "epfo_number": None,
        "esic_number": None,
        "cin": bidder.mca21_cin,
        "dpiit_number": None,
        "nsic_number": None,
        "document_hash": None,
        "make_in_india": bidder.make_in_india,
        "local_content": bidder.local_content_percentage,
    }

    from backend.services.verification_orchestrator import VerificationOrchestrator
    import json

    orchestrator = VerificationOrchestrator()
    report = orchestrator.run_verification(bidder_dict)

    compliance_summary = report.get("compliance_summary", {})
    ai_insights = report.get("ai_insights", {})

    run = VerificationRun(
        bidder_id=bidder_id,
        overall_score=compliance_summary.get("overall_score", 0.0),
        risk_level=compliance_summary.get("risk_level", "Medium"),
        status="Completed",
        ai_recommendation=ai_insights.get("recommendation", ""),
        ai_gaps_detected=json.dumps(ai_insights.get("gaps", [])),
        started_at=datetime.utcnow(),
        completed_at=datetime.utcnow()
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)

    # Save detailed compliance checks
    checks_dict = report.get("verification_details", {})
    for category, details in checks_dict.items():
        check_entry = ComplianceCheck(
            verification_run_id=run.id,
            category=category.upper(),
            source_portal=details.get("source_portal", "Government Portal"),
            status=details.get("status", "Pending"),
            score=details.get("score", 0.0),
            weight=details.get("weight", 10.0),
            details=json.dumps(details.get("details", {})),
            portal_response=json.dumps(details.get("portal_response", {})),
            discrepancies=details.get("discrepancy"),
            checked_at=datetime.utcnow()
        )
        db.add(check_entry)

    await db.commit()
    
    # Reload run with checks loaded
    result = await db.execute(
        select(VerificationRun)
        .options(selectinload(VerificationRun.checks))
        .where(VerificationRun.id == run.id)
    )
    return result.scalar_one()

@router.post("/bulk")
async def verify_bulk(request: BulkVerificationRequest, db: AsyncSession = Depends(get_db)):
    # Placeholder for bulk verification logic
    return {"message": f"Started verification for {len(request.bidder_ids)} bidders"}

@router.get("/run/{run_id}", response_model=VerificationRunResponse)
async def get_verification_run(run_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(VerificationRun)
        .options(selectinload(VerificationRun.checks))
        .where(VerificationRun.id == run_id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Verification run not found")
        
    return run

@router.post("/run/{run_id}/decision", response_model=VerificationRunResponse)
async def make_officer_decision(run_id: int, decision: OfficerDecision, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(VerificationRun)
        .options(selectinload(VerificationRun.checks))
        .where(VerificationRun.id == run_id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Verification run not found")
        
    run.officer_decision = decision.decision
    run.officer_remarks = decision.remarks
    
    await db.commit()
    
    # Reload run with checks loaded
    result = await db.execute(
        select(VerificationRun)
        .options(selectinload(VerificationRun.checks))
        .where(VerificationRun.id == run_id)
    )
    return result.scalar_one()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Placeholder for PDF upload and processing logic
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    return {"filename": file.filename, "message": "File uploaded successfully"}
