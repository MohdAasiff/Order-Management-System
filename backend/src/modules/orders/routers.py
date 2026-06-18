# src/modules/orders/routers.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.infrastructure.database import get_db
from .schemas import OrderCreate, OrderResponse
from .services import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])
order_service = OrderService()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """
    Creates a new customer order transaction, safely locks stock rows, 
    and handles accurate server-side currency calculations.
    """
    return order_service.create_order(db, order)

@router.get("/", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    """
    Retrieves all logged orders in the system. Guaranteed to return a scannable
    empty array ([]) instead of breaking into unhandled states if tables are empty.
    """
    return order_service.get_all_orders(db)

@router.get("/{id}", response_model=OrderResponse)
def get_order(id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single order instance by its unique primary identifier key.
    """
    return order_service.get_order(db, id)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_order(id: int, db: Session = Depends(get_db)):
    """
    Cancels an active order record and safely refunds the corresponding stock quantities 
    back to your live inventory system using strict data synchronization.
    """
    # ✅ THE FIX: Switched to 200 OK to allow returning the confirmation message dictionary
    return order_service.delete_order(db, id)