import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Loan } from '../types';
import { toast } from 'react-toastify';
import { Plus, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const Loans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    interestRate: '',
    termMonths: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(response.data);
    } catch (error) {
      toast.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/loans', formData);
      toast.success('Loan created successfully with amortization schedule');
      setShowModal(false);
      resetForm();
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create loan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      principal: '',
      interestRate: '',
      termMonths: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAID_OFF': return 'bg-blue-100 text-blue-800';
      case 'DEFAULTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
            <p className="text-gray-600 mt-1">Manage loans with amortization schedules</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Loan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.map((loan) => (
            <div key={loan.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{loan.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-semibold text-gray-900">${loan.principal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-semibold text-gray-900">{loan.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Term:</span>
                  <span className="font-semibold text-gray-900">{loan.termMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-semibold text-primary-600">${loan.monthlyPayment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(loan.startDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {loans.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No loans found. Add your first loan to get started.
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Loan</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Loan Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Home Loan, Car Loan, etc."
                    required
                  />
                </div>

                <div>
                  <label className="label">Principal Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.principal}
                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Term (Months)</label>
                  <input
                    type="number"
                    value={formData.termMonths}
                    onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 btn btn-primary">
                    Create Loan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Loans;
