import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

const Reports = () => {
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const [calendarRes, categoryRes] = await Promise.all([
        api.get('/reports/calendar', { params: filters }),
        api.get('/reports/category-breakdown', { params: filters }),
      ]);
      
      setCalendarData(calendarRes.data);
      setCategoryBreakdown(categoryRes.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
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

  const chartData = calendarData.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    amount: item.total,
    count: item.count,
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your spending patterns</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Expenses</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" name="Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for the selected period
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.category?.color }}
                    />
                    <span className="font-medium text-gray-900">{item.category?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">${item.total.toFixed(2)}</span>
                    <span className="text-sm text-gray-600 ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.category?.color,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {item.count} transactions
                </div>
              </div>
            ))}

            {categoryBreakdown.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Calendar View</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Transactions</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {calendarData.map((day, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {format(new Date(day.date), 'EEEE, MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{day.count}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      ${day.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {calendarData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found for the selected period
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
