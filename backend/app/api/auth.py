from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_farmer(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if this phone number is already registered
    existing_user = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # 2. Create the new user
    new_user = User(
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        role=user_data.role
    )
    
    # 3. Save to the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user