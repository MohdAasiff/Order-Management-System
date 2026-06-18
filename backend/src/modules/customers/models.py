from sqlalchemy import Column, Integer, String
from src.infrastructure.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)       # ✅ Added length 255
    email = Column(String(255), unique=True, index=True) # ✅ Added length 255
    phone = Column(String(50))                   # ✅ Added length 50