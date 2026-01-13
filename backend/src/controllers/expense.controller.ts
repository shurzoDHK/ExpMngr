import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate, categoryId, accountId } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (categoryId) where.categoryId = categoryId as string;
    if (accountId) where.accountId = accountId as string;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount, description, date, accountId, categoryId } = req.body;

    if (!amount || !description || !accountId || !categoryId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        userId: userId!,
        accountId,
        categoryId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { decrement: parseFloat(amount) } },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { amount, description, date, accountId, categoryId } = req.body;

    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const oldAmount = expense.amount;
    const newAmount = parseFloat(amount);
    const amountDiff = newAmount - oldAmount;

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amount: newAmount,
        description,
        date: date ? new Date(date) : undefined,
        accountId,
        categoryId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    if (amountDiff !== 0 && accountId === expense.accountId) {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amountDiff } },
      });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.account.update({
      where: { id: expense.accountId },
      data: { balance: { increment: expense.amount } },
    });

    await prisma.expense.delete({ where: { id } });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
