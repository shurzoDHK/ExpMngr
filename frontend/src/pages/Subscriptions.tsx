import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Subscription } from '../types';
import { toast } from 'react-toastify';
import { Plus, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'MONTHLY' as 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/subscriptions', formData);
      toast.success('Subscription created successfully');
      setShowModal(false);
      resetForm();
      fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create subscription');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/subscriptions/${id}`, { isActive: !currentStatus });
      toast.success(`Subscription ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      frequency: 'MONTHLY',
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY': return 'bg-green-100 text-green-800';
      case 'MONTHLY': return 'bg-blue-100 text-blue-800';
      case 'YEARLY': return 'bg-purple-100 text-purple-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-gray-600 mt-1">Track recurring payments with reminders</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Subscription
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{subscription.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getFrequencyColor(subscription.frequency)}`}>
                      {subscription.frequency}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(subscription.id, subscription.isActive)}
                  className={subscription.isActive ? 'text-green-600' : 'text-gray-400'}
                >
                  {subscription.isActive ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-3xl font-bold text-gray-900">
                  ${subscription.amount.toFixed(2)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Payment:</span>
                    <span className="font-semibold text-gray-900">
                      {format(new Date(subscription.nextPaymentDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-semibold text-gray-900">
                      {format(new Date(subscription.startDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${subscription.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {subscription.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {subscriptions.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No subscriptions found. Add your first subscription to get started.
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Subscription</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Subscription Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Netflix, Spotify, etc."
                    required
                  />
                </div>

                <div>
                  <label className="label">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="input"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
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

                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <p>💡 A reminder will be set 3 days before each payment</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 btn btn-primary">
                    Create Subscription
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

export default Subscriptions;
