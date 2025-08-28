'use client'
import React, { useState, useEffect } from 'react';
import { CreditCard, Package, Settings, Bell, AlertCircle, CheckCircle, X, Plus, Trash2 } from 'lucide-react';

// Types
interface FormData {
  city: string;
  country: string;
  state: string;
  addressLine: string;
  zipCode: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
}

interface Subscription {
  id: string;
  status: string;
  email: string;
  createdAt: string;
}

const PaymentSubscriptionApp = () => {
  const [activeTab, setActiveTab] = useState('payment');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Payment Form State
  const [formData, setFormData] = useState<FormData>({
    city: '',
    country: '',
    state: '',
    addressLine: '',
    zipCode: '',
    email: '',
    firstName: '',
    lastName: ''
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0 });

  // Subscription State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [cancelEmail, setCancelEmail] = useState('');
  const [cancelSubscriptionId, setCancelSubscriptionId] = useState('');

  const countries = [
    'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'IN', 'JP', 'BR', 'MX'
  ];

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // Handle form input changes
  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add product to cart
  const addToCart = () => {
    if (newProduct.name && newProduct.price > 0) {
      const newItem: CartItem = {
        id: Date.now().toString(),
        name: newProduct.name,
        price: newProduct.price
      };
      setCartItems(prev => [...prev, newItem]);
      setNewProduct({ name: '', price: 0 });
    }
  };

  // Remove product from cart
  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  // Create payment link
  const createPaymentLink = async () => {
    // Validation checks
    if (cartItems.length === 0) {
      showMessage('Please add at least one item to cart', 'error');
      return;
    }

    if (!formData.firstName.trim()) {
      showMessage('First name is required', 'error');
      return;
    }

    if (!formData.lastName.trim()) {
      showMessage('Last name is required', 'error');
      return;
    }

    if (!formData.email.trim()) {
      showMessage('Email is required', 'error');
      return;
    }

    if (!isValidEmail(formData.email)) {
      showMessage('Please enter a valid email address (e.g., user@example.com)', 'error');
      return;
    }

    if (!formData.country) {
      showMessage('Please select a country', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          cartItems: cartItems.map(item => item.id)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('Payment link created successfully!');
        if (data.paymentLink) {
          window.open(data.paymentLink, '_blank');
        }
        // Clear form after success
        setFormData({
          city: '',
          country: '',
          state: '',
          addressLine: '',
          zipCode: '',
          email: '',
          firstName: '',
          lastName: ''
        });
        setCartItems([]);
      } else {
        showMessage(data.error || 'Failed to create payment link', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!cancelEmail || !cancelSubscriptionId) {
      showMessage('Please provide email and subscription ID', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cancelEmail,
          subscriptionId: cancelSubscriptionId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('Subscription cancelled successfully!');
        setCancelEmail('');
        setCancelSubscriptionId('');
        // Refresh subscriptions list
        loadSubscriptions();
      } else {
        showMessage(data.error || 'Failed to cancel subscription', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load subscriptions (mock data for now)
  const loadSubscriptions = async () => {
    // This would typically fetch from your API
    setSubscriptions([
      { id: 'sub_123', status: 'active', email: 'user@example.com', createdAt: '2024-01-01' },
      { id: 'sub_124', status: 'cancelled', email: 'user2@example.com', createdAt: '2024-01-15' }
    ]);
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="mr-2" size={20} />
          Shopping Cart
        </h3>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Product name"
            value={newProduct.name}
            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={addToCart}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus size={16} />
          </button>
        </div>

        {cartItems.length > 0 ? (
          <div className="space-y-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span>{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <div className="text-right pt-2 border-t">
              <span className="font-bold text-lg">
                Total: ${cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Your cart is empty</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name *"
            value={formData.firstName}
            onChange={(e) => handleFormChange('firstName', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Last Name *"
            value={formData.lastName}
            onChange={(e) => handleFormChange('lastName', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="md:col-span-2">
            <input
              type="email"
              placeholder="Email * (e.g., user@example.com)"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formData.email && !isValidEmail(formData.email) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {formData.email && !isValidEmail(formData.email) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>
          <input
            type="text"
            placeholder="Address Line"
            value={formData.addressLine}
            onChange={(e) => handleFormChange('addressLine', e.target.value)}
            className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleFormChange('city', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => handleFormChange('state', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={formData.country}
            onChange={(e) => handleFormChange('country', e.target.value)}
            className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              !formData.country ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select Country *</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Zip Code"
            value={formData.zipCode}
            onChange={(e) => handleFormChange('zipCode', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={createPaymentLink}
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? 'Creating...' : (
            <>
              <CreditCard className="mr-2" size={20} />
              Create Payment Link
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSubscriptionManagement = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="mr-2" size={20} />
          Cancel Subscription
        </h3>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Customer Email"
            value={cancelEmail}
            onChange={(e) => setCancelEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Subscription ID"
            value={cancelSubscriptionId}
            onChange={(e) => setCancelSubscriptionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={cancelSubscription}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
        
        {subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <div className="font-medium">{sub.email}</div>
                  <div className="text-sm text-gray-500">ID: {sub.id}</div>
                  <div className="text-sm text-gray-500">Created: {sub.createdAt}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sub.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No subscriptions found</p>
        )}
      </div>
    </div>
  );

  const renderWebhookStatus = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Bell className="mr-2" size={20} />
        Webhook Status
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            <span>Webhook Endpoint Active</span>
          </div>
          <span className="text-sm text-gray-500">/api/webhooks/dodo</span>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium mb-2">Supported Events:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Subscription Created (active)</li>
            <li>• Subscription Updated</li>
            <li>• Subscription Cancelled</li>
            <li>• Payment Completed</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment & Subscription Manager
            </h1>
            <p className="text-gray-600">
              Manage payments, subscriptions, and webhook events
            </p>
          </header>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-md flex items-center ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="mr-2" size={20} />
              ) : (
                <AlertCircle className="mr-2" size={20} />
              )}
              {message}
              <button
                onClick={() => setMessage('')}
                className="ml-auto"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex-1 px-6 py-4 text-center font-medium rounded-tl-lg ${
                  activeTab === 'payment'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <CreditCard className="inline mr-2" size={20} />
                Payments
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex-1 px-6 py-4 text-center font-medium ${
                  activeTab === 'subscription'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Settings className="inline mr-2" size={20} />
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab('webhook')}
                className={`flex-1 px-6 py-4 text-center font-medium rounded-tr-lg ${
                  activeTab === 'webhook'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Bell className="inline mr-2" size={20} />
                Webhooks
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'payment' && renderPaymentForm()}
          {activeTab === 'subscription' && renderSubscriptionManagement()}
          {activeTab === 'webhook' && renderWebhookStatus()}
        </div>
      </div>
    </div>
  );
};

export default PaymentSubscriptionApp;