import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Summary } from '../types';
import { Wallet, TrendingDown, CreditCard, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const UserDashboard = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/reports/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  const chartData = summary?.byCategory.map((item, index) => ({
    name: item.category.name,
    value: item.total,
    color: COLORS[index % COLORS.length],
  })) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Balance</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  ${summary?.totalBalance.toFixed(2)}
                </h3>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Wallet className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>{summary?.accounts.length} accounts</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  ${summary?.totalExpenses.toFixed(2)}
                </h3>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <ArrowDown className="w-4 h-4 mr-1" />
              <span>{summary?.expenseCount} transactions</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Loans</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {summary?.activeLoans.count}
                </h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>${summary?.activeLoans.totalMonthlyPayment.toFixed(2)}/month</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Subscriptions</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {summary?.subscriptions.active}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span>{summary?.subscriptions.upcomingThisWeek} due this week</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Expenses by Category</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No expense data available
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Subscriptions</h3>
            <div className="space-y-3">
              {summary?.subscriptions.upcoming && summary.subscriptions.upcoming.length > 0 ? (
                summary.subscriptions.upcoming.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(sub.nextPaymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${sub.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">{sub.frequency}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming subscriptions
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Accounts</h3>
          <div className="space-y-3">
            {summary?.accounts && summary.accounts.length > 0 ? (
              summary.accounts.slice(0, 5).map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      account.type === 'BANK' ? 'bg-blue-100' :
                      account.type === 'CREDIT_CARD' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      <Wallet className={`w-5 h-5 ${
                        account.type === 'BANK' ? 'text-blue-600' :
                        account.type === 'CREDIT_CARD' ? 'text-purple-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-600">{account.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${account.balance.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{account.currency}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No accounts found
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
