from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import jwt
import bcrypt
from datetime import datetime, timedelta

from backend.database import get_db
from backend.models.user import User
from backend.models.audit_log import AuditLog
from backend.schemas import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

SECRET_KEY = "cpcl_gem_bid_compliance_secret_key_2026"
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=24)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed,
        role=user_in.role or "officer",
        department=user_in.department or "Procurement"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    audit = AuditLog(
        action="User Registered",
        entity_type="User",
        entity_id=str(user.id),
        user=user.name,
        details=f"Registered user {user.email} with role {user.role}"
    )
    db.add(audit)
    await db.commit()
    
    return user

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    
    audit = AuditLog(
        action="User Login",
        entity_type="User",
        entity_id=str(user.id),
        user=user.name,
        details=f"User {user.email} logged in successfully"
    )
    db.add(audit)
    await db.commit()
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(email: str = "ananya@cpcl.gov.in", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            id=1,
            name="Ananya Rao",
            email="ananya@cpcl.gov.in",
            hashed_password="mock",
            role="officer",
            department="CPCL Procurement",
            created_at=datetime.utcnow()
        )
    return user
