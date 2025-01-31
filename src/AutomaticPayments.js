import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults for the backend API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

const AutomaticPayments = () => {
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    vendor: '',
    frequency: '',
    bill_date: '',
    amount: '',
    is_fixed_expense: false,
    general_amount: '',
    account_charged: '',
    autopay: false
  });

  // Fetch automatic payments and accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, accountsRes, creditCardsRes] = await Promise.all([
          axios.get('/api/automatic-payments'),
          axios.get('/api/accounts'),
          axios.get('/api/credit-cards')
        ]);
        setPayments(paymentsRes.data);
        setAccounts(accountsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`api/automatic-payments/${editingPayment.id}`, formData);
      } else {
        await api.post('api/automatic-payments', formData);
      }
      
      // Refresh payments list
      const response = await api.get('api/automatic-payments');
      setPayments(response.data);
      
      // Reset form
      setFormData({
        vendor: '',
        frequency: '',
        bill_date: '',
        amount: '',
        is_fixed_expense: false,
        general_amount: '',
        account_charged: '',
        autopay: false
      });
      setIsEditing(false);
      setEditingPayment(null);
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const handleEdit = (payment) => {
    setIsEditing(true);
    setEditingPayment(payment);
    setFormData({
      vendor: payment.vendor,
      frequency: payment.frequency,
      bill_date: payment.bill_date,
      amount: payment.amount || '',
      is_fixed_expense: Boolean(payment.is_fixed_expense),
      general_amount: payment.general_amount || '',
      account_charged: payment.account_charged,
      autopay: Boolean(payment.autopay)
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this automatic payment?')) {
      try {
        await api.delete(`api/automatic-payments/${id}`);
        setPayments(payments.filter(payment => payment.id !== id));
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Automatic Payments</h1>
      
      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Automatic Payment' : 'Add New Automatic Payment'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bill Date</label>
              <input
                type="date"
                name="bill_date"
                value={formData.bill_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Charged</label>
              <select
                name="account_charged"
                value={formData.account_charged}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.name}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={!formData.is_fixed_expense}
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="is_fixed_expense"
                  checked={formData.is_fixed_expense}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Fixed Amount</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">General Amount</label>
              <input
                type="text"
                name="general_amount"
                value={formData.general_amount}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., $50-100"
                disabled={formData.is_fixed_expense}
              />
            </div>
          </div>

          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              name="autopay"
              checked={formData.autopay}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Automatic Payment Enabled</label>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingPayment(null);
                  setFormData({
                    vendor: '',
                    frequency: '',
                    bill_date: '',
                    amount: '',
                    is_fixed_expense: false,
                    general_amount: '',
                    account_charged: '',
                    autopay: false
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {isEditing ? 'Update Payment' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autopay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">{payment.vendor}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.frequency}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.bill_date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.is_fixed_expense ? 
                    `$${payment.amount}` : 
                    payment.general_amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.account_charged}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.autopay ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(payment)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AutomaticPayments;
