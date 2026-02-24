from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal

from app.db.models import AccountType


class AccountBase(BaseModel):
    name: str
    type: AccountType
    balance: Decimal = Decimal(0)
    credit_limit: Optional[Decimal] = None
    institution: Optional[str] = None
    account_number: Optional[str] = None


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    balance: Optional[Decimal] = None
    credit_limit: Optional[Decimal] = None
    institution: Optional[str] = None
    account_number: Optional[str] = None
    is_active: Optional[bool] = None


class AccountResponse(AccountBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
