from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError  # ✅ FAANG Standard: Import SQLAlchemy's Integrity Error
from .repositories import CustomerRepository  # Adjust the import path if your file structure differs slightly
from .schemas import CustomerCreate

class CustomerService:
    def __init__(self):
        self.repo = CustomerRepository()

    def create_customer(self, db: Session, customer_in: CustomerCreate):
        """Creates a new customer after verifying email uniqueness."""
        if self.repo.get_by_email(db, customer_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer with this email address already exists."
            )
        return self.repo.create(db, customer_in)

    def get_all_customers(self, db: Session):
        """Retrieves a list of all registered customers."""
        return self.repo.get_all(db)

    def get_customer(self, db: Session, customer_id: int):
        """Retrieves a single target customer by ID."""
        customer = self.repo.get_by_id(db, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found."
            )
        return customer

    def delete_customer(self, db: Session, customer_id: int):
        """Deletes a customer cleanly, or returns a clear business error if linked to orders."""
        # Step 1: Enforce existence check (raises 404 if not found)
        self.get_customer(db, customer_id)
        
        try:
            # Step 2: Attempt deletion
            return self.repo.delete(db, customer_id)
        except IntegrityError:
            # ✅ FAANG Standard: Catch database constraint failures, return clean message to UI
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete this customer because they are currently linked to active order transaction logs."
            )