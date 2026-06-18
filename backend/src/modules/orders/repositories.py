from sqlalchemy.orm import Session
from .models import Order

class OrderRepository:
    def get_all(self, db: Session):
        return db.query(Order).all()

    def get_by_id(self, db: Session, order_id: int):
        return db.query(Order).filter(Order.id == order_id).first()

    def create(self, db: Session, order: Order):
        db.add(order)
        db.flush() # Flushes to DB to get ID without committing transaction yet
        return order

    def delete(self, db: Session, order_id: int):
        order = self.get_by_id(db, order_id)
        if order:
            db.delete(order)
            db.commit()
        return order