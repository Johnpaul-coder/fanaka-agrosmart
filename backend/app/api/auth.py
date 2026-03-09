from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter()

# Password hashing
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

# ── REGISTER ──────────────────────────────────────────────────────────────────
@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check phone number not already used
    existing = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    new_user = User(
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        role=user_data.role,
        hashed_password=hash_password(user_data.password),
        quality_score=50  # default starting score
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ── LOGIN ──────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # Try phone number first, then full name
    user = db.query(User).filter(User.phone_number == credentials.identifier).first()
    if not user:
        user = db.query(User).filter(User.full_name == credentials.identifier).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Simple token — replace with JWT later if needed
    token = f"fanaka-token-{user.id}-{user.phone_number}"

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user":         user
    }