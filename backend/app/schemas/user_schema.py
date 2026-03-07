from pydantic import BaseModel

# This is what we expect the Frontend to send when a farmer registers
class UserCreate(BaseModel):
    full_name: str
    phone_number: str
    role: str = "farmer"

# This is what the Backend sends back after saving them to the database
class UserResponse(BaseModel):
    id: int
    full_name: str
    phone_number: str
    role: str
    quality_score: int

    class Config:
        from_attributes = True # This tells Pydantic to read your SQLAlchemy database