import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Account } from '../types';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'BANK' as 'BANK' | 'MOBILE_FINANCE' | 'CREDIT_CARD',
    balance: '',
    currency: 'USD',
    accountNumber: '',
    bank: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, formData);
        toast.success('Account updated successfully');
      } else {
        await api.post('/accounts', formData);
        toast.success('Account created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save account');
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
      accountNumber: account.accountNumber || '',
      bank: account.bank || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await api.delete(`/accounts/${id}`);
      toast.success('Account deleted successfully');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'BANK',
      balance: '',
      currency: 'USD',
      accountNumber: '',
      bank: '',
    });
    setEditingAccount(null);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'BANK': return 'bg-blue-100 text-blue-800';
      case 'MOBILE_FINANCE': return 'bg-green-100 text-green-800';
      case 'CREDIT_CARD': return 'bg-purple-100 text-purple-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600 mt-1">Manage your bank accounts and cards</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <Wallet className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{account.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getAccountTypeColor(account.type)}`}>
                      {account.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  ${account.balance.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">{account.currency}</p>
                {account.bank && (
                  <p className="text-sm text-gray-600">Bank: {account.bank}</p>
                )}
                {account.accountNumber && (
                  <p className="text-sm text-gray-600">Account: •••• {account.accountNumber.slice(-4)}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(account)}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="btn btn-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No accounts found. Create your first account to get started.
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Account Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="input"
                  >
                    <option value="BANK">Bank Account</option>
                    <option value="MOBILE_FINANCE">Mobile Finance</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="label">Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Currency</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Bank Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Account Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 btn btn-primary">
                    {editingAccount ? 'Update' : 'Create'}
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

export default Accounts;
