from sqlalchemy.orm import Session
from .models import Product
from .schemas import ProductCreate

class ProductRepository:
    def get_by_sku(self, db: Session, sku: str):
        return db.query(Product).filter(Product.sku == sku).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(Product).offset(skip).limit(limit).all()

    def get_by_id(self, db: Session, product_id: int):
        return db.query(Product).filter(Product.id == product_id).first()

    def create(self, db: Session, product_in: ProductCreate):
        db_product = Product(**product_in.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    def update(self, db: Session, product_id: int, update_data: dict):
        product = self.get_by_id(db, product_id)
        if product:
            for key, value in update_data.items():
                setattr(product, key, value)
            db.commit()
            db.refresh(product)
        return product

    def delete(self, db: Session, product_id: int):
        product = self.get_by_id(db, product_id)
        if product:
            db.delete(product)
            db.commit()
        return product