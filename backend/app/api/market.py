from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product_model import Product, Order
from app.models.user_model import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    quantity: str
    category: Optional[str] = ""
    type: str  # 'crop' or 'input'
    owner_id: int

class OrderCreate(BaseModel):
    product_id: int
    buyer_id: int
    quantity: str
    notes: Optional[str] = ""

# ── Products ─────────────────────────────────────────────
@router.post("/products")
def add_product(data: ProductCreate, db: Session = Depends(get_db)):
    product = Product(
        name=data.name,
        description=data.description,
        price=data.price,
        quantity=data.quantity,
        category=data.category,
        type=data.type,
        owner_id=data.owner_id,
        is_available=True,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/products")
def get_products(type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.is_available == True)
    if type:
        query = query.filter(Product.type == type)
    products = query.all()
    result = []
    for p in products:
        owner = db.query(User).filter(User.id == p.owner_id).first()
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "quantity": p.quantity,
            "category": p.category,
            "type": p.type,
            "owner_id": p.owner_id,
            "owner_name": owner.full_name if owner else "Unknown",
            "is_available": p.is_available,
        })
    return result

@router.get("/products/owner/{owner_id}")
def get_owner_products(owner_id: int, db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.owner_id == owner_id).all()
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "quantity": p.quantity,
            "category": p.category,
            "type": p.type,
            "owner_id": p.owner_id,
            "is_available": p.is_available,
        })
    return result

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}

@router.get("/recommendations")
def get_recommendations(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.type == "input", Product.is_available == True)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    products = query.all()
    result = []
    for p in products:
        owner = db.query(User).filter(User.id == p.owner_id).first()
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "quantity": p.quantity,
            "category": p.category,
            "owner_name": owner.full_name if owner else "Unknown",
        })
    return result

# ── Orders ───────────────────────────────────────────────
@router.post("/orders")
def place_order(data: OrderCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    order = Order(
        product_id=data.product_id,
        buyer_id=data.buyer_id,
        quantity=data.quantity,
        notes=data.notes,
        status="pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {"id": order.id, "status": order.status, "message": "Order placed successfully"}

@router.get("/orders/seller/{seller_id}")
def get_seller_orders(seller_id: int, db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.owner_id == seller_id).all()
    product_ids = [p.id for p in products]
    orders = db.query(Order).filter(Order.product_id.in_(product_ids)).all()
    result = []
    for o in orders:
        product = db.query(Product).filter(Product.id == o.product_id).first()
        buyer = db.query(User).filter(User.id == o.buyer_id).first()
        result.append({
            "id": o.id,
            "product_name": product.name if product else "Unknown",
            "buyer_name": buyer.full_name if buyer else "Unknown",
            "quantity": o.quantity,
            "status": o.status,
            "notes": o.notes or "",
        })
    return result

@router.get("/orders/buyer/{buyer_id}")
def get_buyer_orders(buyer_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.buyer_id == buyer_id).all()
    result = []
    for o in orders:
        product = db.query(Product).filter(Product.id == o.product_id).first()
        result.append({
            "id": o.id,
            "product_name": product.name if product else "Unknown",
            "quantity": o.quantity,
            "status": o.status,
            "notes": o.notes or "",
        })
    return result

@router.patch("/orders/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if status not in ["pending", "confirmed", "delivered"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    order.status = status
    db.commit()
    return {"id": order.id, "status": order.status}