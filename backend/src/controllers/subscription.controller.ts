import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const calculateNextPaymentDate = (
  currentDate: Date,
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
): Date => {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
};

export const getSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        reminders: {
          where: { sent: false },
          orderBy: { reminderDate: 'asc' },
        },
      },
      orderBy: { nextPaymentDate: 'asc' },
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, amount, frequency, startDate } = req.body;

    if (!name || !amount || !frequency) {
      return res.status(400).json({ error: 'Name, amount, and frequency are required' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const nextPayment = calculateNextPaymentDate(start, frequency as 'WEEKLY' | 'MONTHLY' | 'YEARLY');

    const subscription = await prisma.subscription.create({
      data: {
        name,
        amount: parseFloat(amount),
        frequency,
        startDate: start,
        nextPaymentDate: nextPayment,
        userId: userId!,
      },
    });

    const reminderDate = new Date(nextPayment);
    reminderDate.setDate(reminderDate.getDate() - 3);

    await prisma.subscriptionReminder.create({
      data: {
        subscriptionId: subscription.id,
        reminderDate,
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, amount, frequency, isActive } = req.body;

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        name,
        amount: amount ? parseFloat(amount) : undefined,
        frequency,
        isActive,
      },
    });

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

export const deleteSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await prisma.subscription.delete({ where: { id } });

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
};

export const processSubscriptionPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const nextPayment = calculateNextPaymentDate(
      subscription.nextPaymentDate,
      subscription.frequency as 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    );

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: { nextPaymentDate: nextPayment },
    });

    const reminderDate = new Date(nextPayment);
    reminderDate.setDate(reminderDate.getDate() - 3);

    await prisma.subscriptionReminder.create({
      data: {
        subscriptionId: subscription.id,
        reminderDate,
      },
    });

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Process subscription payment error:', error);
    res.status(500).json({ error: 'Failed to process subscription payment' });
  }
};
