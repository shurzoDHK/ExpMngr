from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from datetime import date, datetime, timedelta
from decimal import Decimal
from collections import defaultdict

from app.db import get_db, User, Expense, Account, Category, Loan, Subscription
from app.schemas.report import CalendarReport, SummaryReport, CategoryBreakdown
from app.core.deps import get_current_user

router = APIRouter()


@router.get("/calendar", response_model=CalendarReport)
async def get_calendar_report(
    year: int = Query(...),
    month: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get calendar-wise expense report."""
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)
    
    result = await db.execute(
        select(Expense)
        .where(
            and_(
                Expense.user_id == current_user.id,
                Expense.date >= start_date,
                Expense.date <= end_date
            )
        )
        .options(selectinload(Expense.category), selectinload(Expense.account))
        .order_by(Expense.date)
    )
    expenses = result.scalars().all()
    
    # Group by date
    daily_expenses = defaultdict(list)
    total_amount = Decimal(0)
    
    for expense in expenses:
        date_key = expense.date.date() if isinstance(expense.date, datetime) else expense.date
        daily_expenses[date_key].append(expense)
        total_amount += expense.amount
    
    return CalendarReport(
        year=year,
        month=month,
        total_amount=total_amount,
        total_transactions=len(expenses),
        daily_breakdown={
            str(k): [e for e in v]
            for k, v in daily_expenses.items()
        }
    )


@router.get("/summary", response_model=SummaryReport)
async def get_summary_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary statistics."""
    # Total expenses
    expenses_result = await db.execute(
        select(func.sum(Expense.amount))
        .where(Expense.user_id == current_user.id)
    )
    total_expenses = expenses_result.scalar() or Decimal(0)
    
    # Total accounts balance
    accounts_result = await db.execute(
        select(func.sum(Account.balance))
        .where(Account.user_id == current_user.id)
    )
    total_balance = accounts_result.scalar() or Decimal(0)
    
    # Active loans
    loans_result = await db.execute(
        select(func.sum(func.coalesce(Loan.remaining_amount, 0)))
        .where(Loan.user_id == current_user.id, Loan.status == "active")
    )
    total_debt = loans_result.scalar() or Decimal(0)
    
    # Active subscriptions
    subs_result = await db.execute(
        select(func.sum(Subscription.amount))
        .where(Subscription.user_id == current_user.id, Subscription.is_active == True)
    )
    monthly_subscriptions = subs_result.scalar() or Decimal(0)
    
    return SummaryReport(
        total_balance=total_balance,
        total_expenses=total_expenses,
        total_debt=total_debt,
        monthly_subscriptions=monthly_subscriptions,
    )


@router.get("/by-category", response_model=list[CategoryBreakdown])
async def get_category_breakdown(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get expense breakdown by category."""
    query = (
        select(Category, func.sum(Expense.amount).label("total"))
        .join(Expense, Expense.category_id == Category.id)
        .where(Category.user_id == current_user.id)
    )
    
    filters = []
    if start_date:
        filters.append(Expense.date >= start_date)
    if end_date:
        filters.append(Expense.date <= end_date)
    
    if filters:
        query = query.where(and_(*filters))
    
    query = query.group_by(Category.id).order_by(func.sum(Expense.amount).desc())
    
    result = await db.execute(query)
    rows = result.all()
    
    total = sum(row[1] for row in rows)
    
    return [
        CategoryBreakdown(
            category_id=row[0].id,
            category_name=row[0].name,
            category_color=row[0].color,
            total_amount=row[1],
            percentage=round(float(row[1] / total * 100), 2) if total > 0 else 0
        )
        for row in rows
    ]