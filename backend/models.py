from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True)
    broker_name = Column(String, nullable=False)
    item_name = Column(String, nullable=False)
    order_type = Column(String, nullable=False)  # Purchase / Sale
    order_date = Column(Date, nullable=False)
    quantity_ordered = Column(Float, nullable=False)
    unit_type = Column(String, nullable=False)  # Ton / Trucks
    price_per_unit = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    quantity_sent = Column(Float, default=0.0)
    remaining_quantity = Column(Float, nullable=False)
    status = Column(String, default="Pending")  # Pending / Partial / Completed
    created_at = Column(DateTime, server_default=func.now())

    dispatches = relationship("Dispatch", back_populates="order", cascade="all, delete-orphan")


class Dispatch(Base):
    __tablename__ = "dispatches"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    dispatch_date = Column(Date, nullable=False)
    quantity_sent = Column(Float, nullable=False)
    cumulative_quantity = Column(Float, nullable=False)
    remaining_after = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("Order", back_populates="dispatches")
