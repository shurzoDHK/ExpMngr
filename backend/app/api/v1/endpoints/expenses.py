from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, date
from decimal import Decimal

from app.db import get_db, User, Expense, Account, Category
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.core.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=list[ExpenseResponse])
async def get_expenses(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    category_id: int | None = Query(None),
    account_id: int | None = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get expenses with optional filters."""
    query = select(Expense).where(Expense.user_id == current_user.id)
    
    filters = []
    if start_date:
        filters.append(Expense.date >= start_date)
    if end_date:
        filters.append(Expense.date <= end_date)
    if category_id:
        filters.append(Expense.category_id == category_id)
    if account_id:
        filters.append(Expense.account_id == account_id)
    
    if filters:
        query = query.where(and_(*filters))
    
    query = query.options(selectinload(Expense.category), selectinload(Expense.account))
    query = query.order_by(Expense.date.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new expense."""
    # Verify account belongs to user
    account_result = await db.execute(
        select(Account).where(
            Account.id == expense_data.account_id,
            Account.user_id == current_user.id
        )
    )
    if not account_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid account"
        )
    
    # Verify category belongs to user
    category_result = await db.execute(
        select(Category).where(
            Category.id == expense_data.category_id,
            Category.user_id == current_user.id
        )
    )
    if not category_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category"
        )
    
    expense = Expense(
        **expense_data.dict(),
        user_id=current_user.id
    )
    db.add(expense)
    
    # Update account balance
    account = account_result.scalar_one()
    account.balance = account.balance - expense_data.amount
    
    await db.commit()
    await db.refresh(expense)
    return expense


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get expense by ID."""
    result = await db.execute(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == current_user.id
        ).options(selectinload(Expense.category), selectinload(Expense.account))
    )
    expense = result.scalar_one_or_none()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update expense."""
    result = await db.execute(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == current_user.id
        )
    )
    expense = result.scalar_one_or_none()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    for field, value in expense_data.dict(exclude_unset=True).items():
        setattr(expense, field, value)
    
    await db.commit()
    await db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete expense."""
    result = await db.execute(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == current_user.id
        )
    )
    expense = result.scalar_one_or_none()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    # Restore account balance
    account_result = await db.execute(
        select(Account).where(Account.id == expense.account_id)
    )
    account = account_result.scalar_one()
    account.balance = account.balance + expense.amount
    
    await db.delete(expense)
    await db.commit()