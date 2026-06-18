# src/modules/orders/services.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from .repositories import OrderRepository
from .schemas import OrderCreate
from .models import Order
from src.modules.inventory.models import Product
from src.modules.customers.models import Customer

class OrderService:
    def __init__(self):
        self.repo = OrderRepository()

    def create_order(self, db: Session, order_in: OrderCreate):
        # 1. Validate Customer
        customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Customer not found"
            )

        # 2. Validate Product & Lock row for update (Enterprise-level concurrency safety)
        product = db.query(Product).filter(Product.id == order_in.product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Product not found"
            )

        # 3. Check Inventory Constraints
        if product.quantity < order_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Insufficient stock. Only {product.quantity} units available."
            )

        # 4. Process Business Logic & Explicitly cast types for PostgreSQL stability
        product.quantity -= order_in.quantity
        
        # ✅ THE FIX: Cast the math explicitly to a float to prevent serialization crashes 
        # when product.price is a PostgreSQL DECIMAL type.
        calculated_total = float(product.price * order_in.quantity)

        # 5. Create Order Entity
        new_order = Order(
            customer_id=order_in.customer_id,
            product_id=order_in.product_id,
            quantity=order_in.quantity,
            total_amount=calculated_total
        )
        
        # 6. Save and Commit the Transaction via Repository Pattern
        self.repo.create(db, new_order)
        db.commit()
        db.refresh(new_order)
        return new_order

    def get_all_orders(self, db: Session):
        """Retrieves all orders. Safely falls back to an empty list if None."""
        orders = self.repo.get_all(db)
        return orders if orders else []

    def get_order(self, db: Session, order_id: int):
        order = self.repo.get_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Order not found"
            )
        return order

    def delete_order(self, db: Session, order_id: int):
        order = self.repo.get_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Order not found"
            )
            
        # Refund the inventory with a secure row-level update lock
        product = db.query(Product).filter(Product.id == order.product_id).with_for_update().first()
        if product:
            product.quantity += order.quantity
            
        # Cleanly delete the order record and flush changes to Render
        db.delete(order)
        db.commit()
        return {"message": "Order cancelled and inventory refunded."}