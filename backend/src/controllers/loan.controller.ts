import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  termMonths: number
): number => {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  );
};

const generateAmortizationSchedule = (
  loanId: string,
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date
) => {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  let balance = principal;
  const schedule = [];

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance -= principalPayment;

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    schedule.push({
      loanId,
      month,
      paymentDate,
      payment: monthlyPayment,
      principal: principalPayment,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
};

export const getLoans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: {
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
};

export const createLoan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, principal, interestRate, termMonths, startDate } = req.body;

    if (!name || !principal || !interestRate || !termMonths) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const monthlyPayment = calculateMonthlyPayment(
      parseFloat(principal),
      parseFloat(interestRate),
      parseInt(termMonths)
    );

    const loan = await prisma.loan.create({
      data: {
        name,
        principal: parseFloat(principal),
        interestRate: parseFloat(interestRate),
        termMonths: parseInt(termMonths),
        startDate: startDate ? new Date(startDate) : new Date(),
        monthlyPayment,
        userId: userId!,
      },
    });

    const schedule = generateAmortizationSchedule(
      loan.id,
      loan.principal,
      loan.interestRate,
      loan.termMonths,
      loan.startDate
    );

    await prisma.amortizationSchedule.createMany({
      data: schedule,
    });

    const loanWithSchedule = await prisma.loan.findUnique({
      where: { id: loan.id },
      include: {
        amortization: true,
      },
    });

    res.status(201).json(loanWithSchedule);
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: 'Failed to create loan' });
  }
};

export const getLoanAmortization = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const loan = await prisma.loan.findFirst({
      where: { id, userId },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const schedule = await prisma.amortizationSchedule.findMany({
      where: { loanId: id },
      orderBy: { month: 'asc' },
    });

    res.json(schedule);
  } catch (error) {
    console.error('Get amortization error:', error);
    res.status(500).json({ error: 'Failed to fetch amortization schedule' });
  }
};

export const makeLoanPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { loanId, accountId, amount } = req.body;

    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const monthlyRate = loan.interestRate / 100 / 12;
    const totalPaid = await prisma.loanPayment.aggregate({
      where: { loanId },
      _sum: { principal: true },
    });

    const remainingBalance = loan.principal - (totalPaid._sum.principal || 0);
    const interest = remainingBalance * monthlyRate;
    const principal = parseFloat(amount.toString()) - interest;

    const payment = await prisma.loanPayment.create({
      data: {
        loanId,
        accountId,
        amount: parseFloat(amount.toString()),
        principal,
        interest,
      },
    });

    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { decrement: parseFloat(amount.toString()) } },
    });

    const newRemainingBalance = remainingBalance - principal;
    if (newRemainingBalance <= 0) {
      await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'PAID_OFF' },
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('Make loan payment error:', error);
    res.status(500).json({ error: 'Failed to make loan payment' });
  }
};

export const updateLoan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, status } = req.body;

    const loan = await prisma.loan.findFirst({
      where: { id, userId },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: { name, status },
    });

    res.json(updatedLoan);
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({ error: 'Failed to update loan' });
  }
};

export const deleteLoan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const loan = await prisma.loan.findFirst({
      where: { id, userId },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    await prisma.loan.delete({ where: { id } });

    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
};
