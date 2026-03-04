from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
import models, schemas
from database import get_db

router = APIRouter(prefix="/orders", tags=["orders"])

PURCHASE_ITEMS = ["Cottonseed"]
SALE_ITEMS = [
    "Cattlefeed Husk",
    "Cottonseed Linters",
    "Cottonseed",
    "Cottonseed Oil",
    "Cottonseed Oil Cake",
]

def generate_order_id(db: Session) -> str:
    count = db.query(models.Order).count()
    return f"ORD-{str(count + 1).zfill(4)}"

def compute_status(quantity_ordered: float, quantity_sent: float, unit_type: str) -> str:
    if quantity_sent == 0:
        return "Pending"
    
    if unit_type == "Ton":
        deviation = ((quantity_sent - quantity_ordered) / quantity_ordered) * 100
        if -5 <= deviation <= 5:
            return "Completed"
    else:
        # For Trucks or other units, require exact match
        if quantity_sent == quantity_ordered:
            return "Completed"

    if 0 < quantity_sent < quantity_ordered:
        return "Partial"
    return "Partial"


@router.get("/", response_model=List[schemas.OrderResponse])
def list_orders(
    broker: Optional[str] = Query(None),
    item: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    order_type: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    sort_dir: Optional[str] = Query("desc"),
    db: Session = Depends(get_db)
):
    q = db.query(models.Order)
    if broker:
        q = q.filter(models.Order.broker_name.ilike(f"%{broker}%"))
    if item:
        q = q.filter(models.Order.item_name.ilike(f"%{item}%"))
    if status:
        q = q.filter(models.Order.status == status)
    if order_type:
        q = q.filter(models.Order.order_type == order_type)
    if date_from:
        q = q.filter(models.Order.order_date >= date_from)
    if date_to:
        q = q.filter(models.Order.order_date <= date_to)

    sort_map = {
        "order_date": models.Order.order_date,
        "quantity_ordered": models.Order.quantity_ordered,
        "remaining_quantity": models.Order.remaining_quantity,
        "status": models.Order.status,
        "broker_name": models.Order.broker_name,
        "created_at": models.Order.created_at,
        "total_price": models.Order.total_price,
    }
    col = sort_map.get(sort_by, models.Order.created_at)
    q = q.order_by(col.desc() if sort_dir == "desc" else col.asc())
    return q.all()


@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    total_price = payload.quantity_ordered * payload.price_per_unit
    order = models.Order(
        order_id=generate_order_id(db),
        broker_name=payload.broker_name,
        item_name=payload.item_name,
        order_type=payload.order_type,
        order_date=payload.order_date,
        quantity_ordered=payload.quantity_ordered,
        unit_type=payload.unit_type,
        price_per_unit=payload.price_per_unit,
        total_price=total_price,
        quantity_sent=0.0,
        remaining_quantity=payload.quantity_ordered,
        status="Pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.put("/{order_id}", response_model=schemas.OrderResponse)
def update_order(order_id: int, payload: schemas.OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(order, key, val)

    # Recalculate derived fields
    order.total_price = order.quantity_ordered * order.price_per_unit
    order.remaining_quantity = order.quantity_ordered - order.quantity_sent
    order.status = compute_status(order.quantity_ordered, order.quantity_sent, order.unit_type)

    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
