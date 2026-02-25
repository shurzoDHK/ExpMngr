from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal

from app.db.models import SubscriptionFrequency


class SubscriptionBase(BaseModel):
    name: str
    amount: Decimal
    frequency: SubscriptionFrequency
    start_date: datetime
    description: Optional[str] = None


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    frequency: Optional[SubscriptionFrequency] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SubscriptionResponse(SubscriptionBase):
    id: int
    user_id: int
    next_payment_date: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
