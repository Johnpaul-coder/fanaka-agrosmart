from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.database import Base
from datetime import datetime

class Scan(Base):
    __tablename__ = "scans"

    id             = Column(Integer, primary_key=True, index=True)
    farmer_id      = Column(Integer, ForeignKey("users.id"), index=True)
    crop_type      = Column(String, nullable=True)
    diagnosis_name = Column(String, nullable=True)   # e.g. "Early Blight"
    confidence     = Column(Integer, nullable=True)  # 0-100
    severity       = Column(String, nullable=True)   # Low/Moderate/High/Critical
    full_result    = Column(Text, nullable=True)      # Full JSON from Groq
    created_at     = Column(DateTime, default=datetime.utcnow)