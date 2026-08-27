from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from backend.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, server_default=func.now())
    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(String)
    user = Column(String, default='system')
    category = Column(String, nullable=True)
    details = Column(Text)
    ip_address = Column(String, nullable=True)
