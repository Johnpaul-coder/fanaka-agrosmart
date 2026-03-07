from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Hub(Base):
    __tablename__ = "hubs"

    id = Column(Integer, primary_key=True, index=True)
    hub_name = Column(String, index=True) # e.g., "Thika Main Hub"
    county = Column(String) # e.g., "Machakos", "Kiambu"
    capacity_tons = Column(Integer)
    manager_name = Column(String)