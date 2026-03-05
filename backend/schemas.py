from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


# ─── Dispatch Schemas ───────────────────────────────────────────────────────

class DispatchCreate(BaseModel):
    order_id: int
    dispatch_date: date
    quantity_sent: float


class DispatchResponse(BaseModel):
    id: int
    order_id: int
    dispatch_date: date
    quantity_sent: float
    cumulative_quantity: float
    remaining_after: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Order Schemas ──────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    broker_name: str
    item_name: str
    order_type: str
    order_date: date
    quantity_ordered: float
    unit_type: str
    price_per_unit: float


class OrderUpdate(BaseModel):
    broker_name: Optional[str] = None
    item_name: Optional[str] = None
    order_type: Optional[str] = None
    order_date: Optional[date] = None
    quantity_ordered: Optional[float] = None
    unit_type: Optional[str] = None
    price_per_unit: Optional[float] = None


class OrderResponse(BaseModel):
    id: int
    order_id: str
    broker_name: str
    item_name: str
    order_type: str
    order_date: date
    quantity_ordered: float
    unit_type: str
    price_per_unit: float
    total_price: float
    quantity_sent: float
    remaining_quantity: float
    status: str
    created_at: Optional[datetime] = None
    dispatches: List[DispatchResponse] = []

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ──────────────────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_purchase_orders: int
    total_sales_orders: int
    pending_orders: int
    completed_orders: int
    total_volume: float
    total_transaction_value: float


class ToleranceLogEntry(BaseModel):
    order_id: str
    broker: str
    item: str
    ordered_quantity: float
    actual_quantity: float
    deviation_percent: float
    within_tolerance: bool
    unit_type: str
