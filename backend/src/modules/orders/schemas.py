# src/modules/orders/schemas.py
from pydantic import BaseModel, Field, ConfigDict

class OrderBase(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(gt=0, description="Quantity must be greater than zero")

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    total_amount: float # Ensure float mapping matches standard JSON representations cleanly

    model_config = ConfigDict(from_attributes=True)