from datetime import date, datetime
from typing import Dict, List, Any
from pydantic import BaseModel
from decimal import Decimal


class CalendarReport(BaseModel):
    year: int
    month: int
    total_amount: Decimal
    total_transactions: int
    daily_breakdown: Dict[str, List[Any]]


class SummaryReport(BaseModel):
    total_balance: Decimal
    total_expenses: Decimal
    total_debt: Decimal
    monthly_subscriptions: Decimal


class CategoryBreakdown(BaseModel):
    category_id: int
    category_name: str
    category_color: str
    total_amount: Decimal
    percentage: float
