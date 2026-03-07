from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True)
    role = Column(String, default="farmer")
    
    # Location coordinates (we will use these later for the Map!)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    quality_score = Column(Integer, default=50)