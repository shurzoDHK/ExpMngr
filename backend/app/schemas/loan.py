from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal


class LoanBase(BaseModel):
    name: str
    principal_amount: Decimal
    interest_rate: Decimal
    term_months: int
    start_date: datetime


class LoanCreate(LoanBase):
    pass


class LoanUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None


class LoanResponse(LoanBase):
    id: int
    user_id: int
    remaining_amount: Decimal
    monthly_payment: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AmortizationScheduleResponse(BaseModel):
    id: int
    loan_id: int
    payment_number: int
    payment_date: datetime
    principal_payment: Decimal
    interest_payment: Decimal
    total_payment: Decimal
    remaining_balance: Decimal
    is_paid: bool
    created_at: datetime

    class Config:
        from_attributes = True
