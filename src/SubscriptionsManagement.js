import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionsManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    fee: '',
    interval: 'monthly',
    renewalDate: '',
    paymentMethod: '',
    autoRenewal: false,
    notes: '',
  });
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch existing subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get('/api/subscriptions');
        setSubscriptions(response.data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };
    fetchSubscriptions();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSubscription({
      ...newSubscription,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle adding a new subscription
  const handleAddSubscription = async () => {
    try {
      const response = await axios.post('/api/subscriptions', newSubscription);
      setSubscriptions([...subscriptions, response.data]);
      // Reset the form
      setNewSubscription({
        name: '',
        fee: '',
        interval: 'monthly',
        renewalDate: '',
        paymentMethod: '',
        autoRenewal: false,
        notes: '',
      });
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding subscription:', error);
      setErrorMessage('Failed to add subscription. Please try again.');
    }
  };

  // Handle updating a subscription
  const handleUpdateSubscription = async () => {
    try {
      const response = await axios.put(
        `/api/subscriptions/${editingSubscription.id}`,
        newSubscription
      );
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === editingSubscription.id ? response.data : sub
        )
      );
      // Reset the form and editing state
      setNewSubscription({
        name: '',
        fee: '',
        interval: 'monthly',
        renewalDate: '',
        paymentMethod: '',
        autoRenewal: false,
        notes: '',
      });
      setEditingSubscription(null);
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating subscription:', error);
      setErrorMessage('Failed to update subscription. Please try again.');
    }
  };

  // Handle deleting a subscription
  const handleDeleteSubscription = async (id) => {
    try {
      await axios.delete(`/api/subscriptions/${id}`);
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  // Handle edit button click
  const handleEditClick = (subscription) => {
    setEditingSubscription(subscription);
    setNewSubscription(subscription);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Manage Subscriptions</h2>

      {/* Add/Edit Subscription Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-xl font-medium mb-4">
          {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subscription Name
            </label>
            <input
              type="text"
              name="name"
              value={newSubscription.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subscription Fee
            </label>
            <input
              type="number"
              name="fee"
              value={newSubscription.fee}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Billing Interval
            </label>
            <select
              name="interval"
              value={newSubscription.interval}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Renewal Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Renewal Date
            </label>
            <input
              type="date"
              name="renewalDate"
              value={newSubscription.renewalDate}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <input
              type="text"
              name="paymentMethod"
              value={newSubscription.paymentMethod}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Auto Renewal */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="autoRenewal"
              checked={newSubscription.autoRenewal}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm font-medium text-gray-700">
              Auto Renewal
            </label>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={newSubscription.notes}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              rows="3"
            />
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 text-red-600">{errorMessage}</div>
        )}

        {/* Form Buttons */}
        <div className="mt-6">
          <button
            onClick={
              editingSubscription ? handleUpdateSubscription : handleAddSubscription
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
          </button>
          {editingSubscription && (
            <button
              onClick={() => {
                setEditingSubscription(null);
                setNewSubscription({
                  name: '',
                  fee: '',
                  interval: 'monthly',
                  renewalDate: '',
                  paymentMethod: '',
                  autoRenewal: false,
                  notes: '',
                });
                setErrorMessage('');
              }}
              className="ml-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Existing Subscriptions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-medium mb-4">Your Subscriptions</h3>
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Headers */}
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Interval
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Renewal Date
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subscription.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${subscription.fee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subscription.interval}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subscription.renewalDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(subscription)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubscription(subscription.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                >
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionsManagement;