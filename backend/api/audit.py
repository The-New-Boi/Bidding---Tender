from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from backend.database import get_db
from backend.models.audit_log import AuditLog
from backend.schemas import AuditLogResponse

router = APIRouter(prefix="/api/audit", tags=["Audit"])

@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs(
    skip: int = 0, 
    limit: int = 100,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(AuditLog)
    
    if action:
        query = query.where(AuditLog.action == action)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
        
    query = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    
    return result.scalars().all()

@router.get("/export")
async def export_audit_logs(db: AsyncSession = Depends(get_db)):
    # Placeholder for CSV export
    return {"message": "Export feature coming soon"}
