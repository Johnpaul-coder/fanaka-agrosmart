from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, index=True)
    description  = Column(String, default="")
    price        = Column(Float)
    quantity     = Column(String)
    category     = Column(String, default="")
    type         = Column(String)  # 'crop' or 'input'
    owner_id     = Column(Integer, ForeignKey("users.id"))
    is_available = Column(Boolean, default=True)


class Order(Base):
    __tablename__ = "orders"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    buyer_id   = Column(Integer, ForeignKey("users.id"))
    quantity   = Column(String)
    status     = Column(String, default="pending")  # pending/confirmed/delivered
    notes      = Column(String, default="")