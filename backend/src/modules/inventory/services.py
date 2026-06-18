from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError  # ✅ FAANG Standard: Import SQLAlchemy's Integrity Error
from .repositories import ProductRepository
from .schemas import ProductCreate, ProductUpdate

class ProductService:
    def __init__(self):
        self.repo = ProductRepository()

    def create_product(self, db: Session, product_in: ProductCreate):
        """Creates a new product after verifying the SKU uniqueness constraint."""
        if self.repo.get_by_sku(db, product_in.sku):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Product with this SKU already exists"
            )
        return self.repo.create(db, product_in)

    def get_all_products(self, db: Session):
        """Retrieves a list of all active products in inventory."""
        return self.repo.get_all(db)

    def get_product(self, db: Session, product_id: int):
        """Retrieves a single target product by its primary identifier."""
        product = self.repo.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Product not found"
            )
        return product

    def update_product(self, db: Session, product_id: int, product_in: ProductUpdate):
        """Updates product metadata dynamically while ensuring SKU constraints are respected."""
        product = self.get_product(db, product_id)  # Enforces 404 validation before parsing payload
        update_data = product_in.model_dump(exclude_unset=True)
        
        # Guard clause: Check SKU uniqueness if SKU is being mutated
        if "sku" in update_data and update_data["sku"] != product.sku:
            if self.repo.get_by_sku(db, update_data["sku"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="SKU already exists"
                )
                
        return self.repo.update(db, product_id, update_data)

    def delete_product(self, db: Session, product_id: int):
        """Deletes a product or raises an informative error if it is attached to transaction logs."""
        # Enforce existence check first
        self.get_product(db, product_id)
        
        try:
            return self.repo.delete(db, product_id)
        except IntegrityError:
            # ✅ FAANG Standard: Prevent database crash logs, return clean business warning to client
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete this product because it is currently linked to an active order transaction."
            )