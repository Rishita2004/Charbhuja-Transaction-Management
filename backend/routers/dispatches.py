from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(prefix="/dispatches", tags=["dispatches"])


def get_tolerance_percent(unit_type: str) -> float:
    unit = (unit_type or "").strip().lower()
    return 5.0 if unit == "ton" else 0.0


def compute_status(quantity_ordered: float, quantity_sent: float, unit_type: str) -> str:
    if quantity_sent == 0:
        return "Pending"
    if quantity_ordered == 0:
        return "Partial"

    deviation = ((quantity_sent - quantity_ordered) / quantity_ordered) * 100
    tolerance = get_tolerance_percent(unit_type)
    if -tolerance <= deviation <= tolerance:
        return "Completed"
    return "Partial"


@router.get("/{order_id}", response_model=List[schemas.DispatchResponse])
def list_dispatches(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order.dispatches


@router.post("/", response_model=schemas.DispatchResponse, status_code=201)
def add_dispatch(payload: schemas.DispatchCreate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_cumulative = order.quantity_sent + payload.quantity_sent
    new_remaining = order.quantity_ordered - new_cumulative

    dispatch = models.Dispatch(
        order_id=order.id,
        dispatch_date=payload.dispatch_date,
        quantity_sent=payload.quantity_sent,
        cumulative_quantity=new_cumulative,
        remaining_after=new_remaining,
    )
    db.add(dispatch)

    # Update order
    order.quantity_sent = new_cumulative
    order.remaining_quantity = new_remaining
    order.status = compute_status(order.quantity_ordered, new_cumulative, order.unit_type)

    db.commit()
    db.refresh(dispatch)
    return dispatch


@router.delete("/{dispatch_id}", status_code=204)
def delete_dispatch(dispatch_id: int, db: Session = Depends(get_db)):
    dispatch = db.query(models.Dispatch).filter(models.Dispatch.id == dispatch_id).first()
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")

    order = dispatch.order
    db.delete(dispatch)
    db.flush()

    # Recalculate cumulative from remaining dispatches
    remaining_dispatches = sorted(order.dispatches, key=lambda d: d.created_at or d.dispatch_date)
    cumulative = 0.0
    for d in remaining_dispatches:
        cumulative += d.quantity_sent
        d.cumulative_quantity = cumulative
        d.remaining_after = order.quantity_ordered - cumulative

    order.quantity_sent = cumulative
    order.remaining_quantity = order.quantity_ordered - cumulative
    order.status = compute_status(order.quantity_ordered, cumulative, order.unit_type)

    db.commit()
