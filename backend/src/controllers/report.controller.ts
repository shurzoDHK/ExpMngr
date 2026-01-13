import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCalendarReport = async (req: AuthRequest, res: Response) => {
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
      orderBy: { date: 'asc' },
    });

    const groupedByDate: Record<string, any[]> = {};
    expenses.forEach((expense) => {
      const dateKey = expense.date.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(expense);
    });

    const calendar = Object.entries(groupedByDate).map(([date, expenses]) => ({
      date,
      expenses,
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      count: expenses.length,
    }));

    res.json(calendar);
  } catch (error) {
    console.error('Get calendar report error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar report' });
  }
};

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [
      totalExpenses,
      expensesByCategory,
      expensesByAccount,
      accounts,
      activeLoans,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['categoryId'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['accountId'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.account.findMany({
        where: { userId },
        select: { id: true, name: true, balance: true, type: true },
      }),
      prisma.loan.findMany({
        where: { userId, status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          principal: true,
          monthlyPayment: true,
        },
      }),
      prisma.subscription.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          name: true,
          amount: true,
          frequency: true,
          nextPaymentDate: true,
        },
      }),
    ]);

    const categoryDetails = await Promise.all(
      expensesByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          category,
          total: item._sum.amount,
          count: item._count,
        };
      })
    );

    const accountDetails = await Promise.all(
      expensesByAccount.map(async (item) => {
        const account = await prisma.account.findUnique({
          where: { id: item.accountId },
        });
        return {
          account,
          total: item._sum.amount,
          count: item._count,
        };
      })
    );

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLoanPayments = activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    const upcomingSubscriptions = activeSubscriptions.filter(
      (sub) => new Date(sub.nextPaymentDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    res.json({
      totalExpenses: totalExpenses._sum.amount || 0,
      expenseCount: totalExpenses._count,
      byCategory: categoryDetails,
      byAccount: accountDetails,
      totalBalance,
      accounts,
      activeLoans: {
        count: activeLoans.length,
        totalMonthlyPayment: totalLoanPayments,
        loans: activeLoans,
      },
      subscriptions: {
        active: activeSubscriptions.length,
        upcomingThisWeek: upcomingSubscriptions.length,
        upcoming: upcomingSubscriptions,
      },
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

export const getCategoryBreakdown = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const expenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    const breakdown = await Promise.all(
      expenses.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          category,
          total: item._sum.amount || 0,
          count: item._count,
          percentage: 0,
        };
      })
    );

    const total = breakdown.reduce((sum, item) => sum + item.total, 0);
    breakdown.forEach((item) => {
      item.percentage = total > 0 ? (item.total / total) * 100 : 0;
    });

    res.json(breakdown);
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
};
