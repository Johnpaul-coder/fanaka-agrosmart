from pydantic import BaseModel
from typing import Optional

# What the frontend sends when registering
class UserCreate(BaseModel):
    full_name:    str
    phone_number: str
    role:         str = "farmer"
    password:     str

# What the frontend sends when logging in
class UserLogin(BaseModel):
    identifier: str  # accepts full_name OR phone_number
    password:   str

# What the backend sends back after saving to database
class UserResponse(BaseModel):
    id:            int
    full_name:     str
    phone_number:  str
    role:          str
    quality_score: int

    class Config:
        from_attributes = True  # reads SQLAlchemy models

# What the backend sends back after a successful login
class TokenResponse(BaseModel):
    access_token: str
    token_type:   str
    user:         UserResponse