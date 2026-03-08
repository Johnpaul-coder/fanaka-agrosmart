import os
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserResponse

# NEW: This line "unlocks" the .env file so Python can read it
load_dotenv()

router = APIRouter()

# We need a shape for the login data
class AdminLogin(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=UserResponse)
def register_farmer(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    new_user = User(
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.get("/farmers", response_model=List[UserResponse])
def get_all_farmers(db: Session = Depends(get_db)):
    farmers = db.query(User).filter(User.role == "farmer").all()
    return farmers

# ==========================================
# NEW FEATURE: SECURE ADMIN LOGIN
# ==========================================
@router.post("/admin-login")
def login_admin(credentials: AdminLogin):
    # Reach into the .env file to get the true master keys
    # (If the .env file is missing, it safely falls back to 'admin' / 'fanaka2026')
    env_username = os.getenv("ADMIN_USERNAME", "admin")
    env_password = os.getenv("ADMIN_PASSWORD", "fanaka2026")

    # Compare what the user typed against the .env secrets
    if credentials.username == env_username and credentials.password == env_password:
        return {"access_token": "fanaka-super-secret-token-8899"}
    else:
        raise HTTPException(status_code=401, detail="Incorrect username or password")