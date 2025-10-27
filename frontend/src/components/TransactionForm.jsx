// frontend/src/components/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      INCOME {
        name
        subcategories
        icon
        color
      }
      EXPENSE {
        name
        subcategories
        icon
        color
      }
    }
  }
`;

const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      type
      amount
      date
      merchant
      category
      subcategory
      notes
      tags
      paymentMethod
    }
  }
`;

const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      type
      amount
      date
      merchant
      category
      subcategory
      notes
      tags
      paymentMethod
    }
  }
`;

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    category: '',
    subcategory: '',
    notes: '',
    tags: '',
    paymentMethod: 'other',
    isRecurring: false,
    recurringPeriod: 'monthly'
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const [createTransaction, { loading: creating }] = useMutation(CREATE_TRANSACTION);
  const [updateTransaction, { loading: updating }] = useMutation(UPDATE_TRANSACTION);

  const isEditing = !!transaction;
  const loading = creating || updating;

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'EXPENSE',
        amount: transaction.amount?.toString() || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        merchant: transaction.merchant || '',
        category: transaction.category || '',
        subcategory: transaction.subcategory || '',
        notes: transaction.notes || '',
        tags: transaction.tags ? transaction.tags.join(', ') : '',
        paymentMethod: transaction.paymentMethod || 'other',
        isRecurring: transaction.isRecurring || false,
        recurringPeriod: transaction.recurringPeriod || 'monthly'
      });
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const input = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isRecurring: formData.isRecurring || undefined,
        recurringPeriod: formData.isRecurring ? formData.recurringPeriod : undefined
      };

      if (isEditing) {
        await updateTransaction({
          variables: { id: transaction.id, input },
          refetchQueries: ['GetTransactions', 'GetDashboardStats']
        });
      } else {
        await createTransaction({
          variables: { input },
          refetchQueries: ['GetTransactions', 'GetDashboardStats']
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getCategoriesForType = () => {
    if (!categoriesData) return [];
    return categoriesData.categories[formData.type] || [];
  };

  const getSubcategoriesForCategory = () => {
    const categories = getCategoriesForType();
    const selectedCategory = categories.find(cat => cat.name === formData.category);
    return selectedCategory?.subcategories || [];
  };

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'credit_card', label: '💳 Credit Card' },
    { value: 'debit_card', label: '💳 Debit Card' },
    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
    { value: 'digital_wallet', label: '📱 Digital Wallet' },
    { value: 'check', label: '📄 Check' },
    { value: 'other', label: '🔘 Other' }
  ];

  return (
    <div className="transaction-form-container">
      <form onSubmit={handleSubmit} className="transaction-form">
        <h3>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h3>

        {/* Type and Amount Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="EXPENSE">💸 Expense</option>
              <option value="INCOME">💰 Income</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Date and Merchant Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="merchant">Merchant:</label>
            <input
              type="text"
              id="merchant"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              placeholder="Store name or description"
            />
          </div>
        </div>

        {/* Category and Subcategory Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category...</option>
              {getCategoriesForType().map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subcategory">Subcategory:</label>
            <select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              disabled={!formData.category}
            >
              <option value="">Optional subcategory...</option>
              {getSubcategoriesForCategory().map(subcat => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method:</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            {paymentMethods.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags">Tags:</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Separate tags with commas (e.g., grocery, weekly, essential)"
          />
          <small>Tags help you organize and search transactions later</small>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes about this transaction..."
            rows="3"
          />
        </div>

        {/* Recurring Transaction */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
            />
            This is a recurring transaction
          </label>
        </div>

        {formData.isRecurring && (
          <div className="form-group">
            <label htmlFor="recurringPeriod">Recurring Period:</label>
            <select
              id="recurringPeriod"
              name="recurringPeriod"
              value={formData.recurringPeriod}
              onChange={handleChange}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Update Transaction' : 'Add Transaction')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;