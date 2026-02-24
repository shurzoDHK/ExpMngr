from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.db import get_db, User, Subscription, SubscriptionReminder
from app.db.models import SubscriptionFrequency
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from app.core.deps import get_current_user

router = APIRouter()


def calculate_next_payment(start_date: datetime, frequency: SubscriptionFrequency) -> datetime:
    """Calculate next payment date based on frequency."""
    now = datetime.utcnow()
    next_date = start_date
    
    while next_date <= now:
        if frequency == SubscriptionFrequency.WEEKLY:
            next_date += timedelta(weeks=1)
        elif frequency == SubscriptionFrequency.MONTHLY:
            # Add one month
            if next_date.month == 12:
                next_date = datetime(next_date.year + 1, 1, next_date.day)
            else:
                next_date = datetime(next_date.year, next_date.month + 1, next_date.day)
        elif frequency == SubscriptionFrequency.YEARLY:
            next_date = datetime(next_date.year + 1, next_date.month, next_date.day)
    
    return next_date


@router.get("/", response_model=list[SubscriptionResponse])
async def get_subscriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all subscriptions for current user."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new subscription."""
    next_payment = calculate_next_payment(
        subscription_data.start_date,
        subscription_data.frequency
    )
    
    subscription = Subscription(
        **subscription_data.dict(),
        next_payment_date=next_payment,
        user_id=current_user.id
    )
    db.add(subscription)
    
    # Create reminder for next payment
    reminder_date = next_payment - timedelta(days=3)
    reminder = SubscriptionReminder(
        subscription=subscription,
        reminder_date=reminder_date
    )
    db.add(reminder)
    
    await db.commit()
    await db.refresh(subscription)
    return subscription


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get subscription by ID."""
    result = await db.execute(
        select(Subscription).where(
            Subscription.id == subscription_id,
            Subscription.user_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    return subscription


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: int,
    subscription_data: SubscriptionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update subscription."""
    result = await db.execute(
        select(Subscription).where(
            Subscription.id == subscription_id,
            Subscription.user_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    for field, value in subscription_data.dict(exclude_unset=True).items():
        setattr(subscription, field, value)
    
    await db.commit()
    await db.refresh(subscription)
    return subscription


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription(
    subscription_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete subscription."""
    result = await db.execute(
        select(Subscription).where(
            Subscription.id == subscription_id,
            Subscription.user_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    await db.delete(subscription)
    await db.commit()