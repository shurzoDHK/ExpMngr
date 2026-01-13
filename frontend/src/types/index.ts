export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface Account {
  id: string;
  name: string;
  type: 'BANK' | 'MOBILE_FINANCE' | 'CREDIT_CARD';
  balance: number;
  currency: string;
  accountNumber?: string;
  bank?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  userId: string;
  accountId: string;
  categoryId: string;
  category?: Category;
  account?: Account;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  monthlyPayment: number;
  status: 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmortizationSchedule {
  id: string;
  loanId: string;
  month: number;
  paymentDate: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  nextPaymentDate: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  totalExpenses: number;
  expenseCount: number;
  byCategory: Array<{
    category: Category;
    total: number;
    count: number;
  }>;
  byAccount: Array<{
    account: Account;
    total: number;
    count: number;
  }>;
  totalBalance: number;
  accounts: Account[];
  activeLoans: {
    count: number;
    totalMonthlyPayment: number;
    loans: Loan[];
  };
  subscriptions: {
    active: number;
    upcomingThisWeek: number;
    upcoming: Subscription[];
  };
}
