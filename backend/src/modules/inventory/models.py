from sqlalchemy import Column, Integer, String, Float
from src.infrastructure.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)       # ✅ Added length 255
    sku = Column(String(100), unique=True, index=True) # ✅ Added length 100
    price = Column(Float)
    quantity = Column(Integer)