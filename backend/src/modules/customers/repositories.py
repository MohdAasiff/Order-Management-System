from sqlalchemy.orm import Session
from .models import Customer
from .schemas import CustomerCreate

class CustomerRepository:
    def get_by_email(self, db: Session, email: str):
        return db.query(Customer).filter(Customer.email == email).first()

    def get_all(self, db: Session):
        return db.query(Customer).all()

    def get_by_id(self, db: Session, customer_id: int):
        return db.query(Customer).filter(Customer.id == customer_id).first()

    def create(self, db: Session, customer_in: CustomerCreate):
        db_customer = Customer(**customer_in.model_dump())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer

    def delete(self, db: Session, customer_id: int):
        customer = self.get_by_id(db, customer_id)
        if customer:
            db.delete(customer)
            db.commit()
        return customer