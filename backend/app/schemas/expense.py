from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal

from app.schemas.category import CategoryResponse
from app.schemas.account import AccountResponse


class ExpenseBase(BaseModel):
    amount: Decimal
    description: Optional[str] = None
    date: date
    account_id: int
    category_id: int
    is_recurring: bool = False


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    date: Optional[date] = None
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    is_recurring: Optional[bool] = None


class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    account: Optional[AccountResponse] = None

    class Config:
        from_attributes = True
