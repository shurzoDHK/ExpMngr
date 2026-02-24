from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from decimal import Decimal
import math

from app.db import get_db, User, Loan, AmortizationSchedule
from app.schemas.loan import LoanCreate, LoanUpdate, LoanResponse, AmortizationScheduleResponse
from app.core.deps import get_current_user

router = APIRouter()


def calculate_amortization(principal: Decimal, annual_rate: Decimal, months: int, start_date: datetime) -> list:
    """Calculate amortization schedule."""
    monthly_rate = annual_rate / Decimal(100) / Decimal(12)
    
    if monthly_rate == 0:
        monthly_payment = principal / Decimal(months)
    else:
        monthly_payment = principal * (
            monthly_rate * pow(1 + float(monthly_rate), months)
        ) / (pow(1 + float(monthly_rate), months) - 1)
    
    schedule = []
    balance = principal
    
    for i in range(1, months + 1):
        if monthly_rate == 0:
            interest_payment = Decimal(0)
            principal_payment = monthly_payment
        else:
            interest_payment = balance * monthly_rate
            principal_payment = monthly_payment - interest_payment
        
        balance = balance - principal_payment
        if balance < 0:
            balance = Decimal(0)
        
        payment_date = datetime(
            start_date.year + (start_date.month + i - 1 - 1) // 12,
            (start_date.month + i - 1 - 1) % 12 + 1,
            start_date.day
        )
        
        schedule.append({
            "payment_number": i,
            "payment_date": payment_date,
            "principal_payment": round(principal_payment, 2),
            "interest_payment": round(interest_payment, 2),
            "total_payment": round(monthly_payment, 2),
            "remaining_balance": round(balance, 2),
        })
    
    return schedule, round(monthly_payment, 2)


@router.get("/", response_model=list[LoanResponse])
async def get_loans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all loans for current user."""
    result = await db.execute(
        select(Loan).where(Loan.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    loan_data: LoanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new loan with amortization schedule."""
    schedule, monthly_payment = calculate_amortization(
        loan_data.principal_amount,
        loan_data.interest_rate,
        loan_data.term_months,
        loan_data.start_date
    )
    
    loan = Loan(
        name=loan_data.name,
        principal_amount=loan_data.principal_amount,
        interest_rate=loan_data.interest_rate,
        term_months=loan_data.term_months,
        start_date=loan_data.start_date,
        remaining_amount=loan_data.principal_amount,
        monthly_payment=monthly_payment,
        user_id=current_user.id
    )
    db.add(loan)
    await db.flush()
    
    # Create amortization schedule entries
    for payment in schedule:
        amort = AmortizationSchedule(
            loan_id=loan.id,
            **payment
        )
        db.add(amort)
    
    await db.commit()
    await db.refresh(loan)
    return loan


@router.get("/{loan_id}", response_model=LoanResponse)
async def get_loan(
    loan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get loan by ID."""
    result = await db.execute(
        select(Loan).where(
            Loan.id == loan_id,
            Loan.user_id == current_user.id
        )
    )
    loan = result.scalar_one_or_none()
    
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    return loan


@router.get("/{loan_id}/amortization", response_model=list[AmortizationScheduleResponse])
async def get_amortization_schedule(
    loan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get amortization schedule for a loan."""
    # Verify loan belongs to user
    loan_result = await db.execute(
        select(Loan).where(
            Loan.id == loan_id,
            Loan.user_id == current_user.id
        )
    )
    if not loan_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    result = await db.execute(
        select(AmortizationSchedule).where(
            AmortizationSchedule.loan_id == loan_id
        ).order_by(AmortizationSchedule.payment_number)
    )
    return result.scalars().all()


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan(
    loan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete loan."""
    result = await db.execute(
        select(Loan).where(
            Loan.id == loan_id,
            Loan.user_id == current_user.id
        )
    )
    loan = result.scalar_one_or_none()
    
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    await db.delete(loan)
    await db.commit()