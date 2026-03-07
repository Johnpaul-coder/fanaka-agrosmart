from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String) # e.g., "Seed", "Fertilizer", "Produce"
    price = Column(Float)
    quantity_in_stock = Column(Integer)
    
    # Links the product to the User (Farmer or Shop) who is selling it
    seller_id = Column(Integer, ForeignKey("users.id"))
    
    # Status: "Pending Inspection", "Fanaka Certified", "Sold"
    status = Column(String, default="Pending Inspection")