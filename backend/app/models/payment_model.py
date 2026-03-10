from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from app.database import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "payments"

    id                   = Column(Integer, primary_key=True, index=True)
    order_id             = Column(Integer, ForeignKey("orders.id"), unique=True, index=True)
    payer_phone          = Column(String)
    payer_role           = Column(String)
    amount               = Column(Float)
    platform_fee         = Column(Float, nullable=True)
    seller_amount        = Column(Float, nullable=True)
    checkout_request_id  = Column(String, nullable=True, index=True)
    merchant_request_id  = Column(String, nullable=True)
    mpesa_code           = Column(String, nullable=True)
    b2c_conversation_id  = Column(String, nullable=True, index=True)
    seller_phone         = Column(String, nullable=True)
    status               = Column(String, default="pending", index=True)
    paid_at              = Column(DateTime, nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow)