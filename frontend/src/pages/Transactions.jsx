// frontend/src/pages/Transactions.jsx
import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { format } from 'date-fns';
import TransactionForm from '../components/TransactionForm';

const GET_TRANSACTIONS = gql`
  query GetTransactions($month: String, $category: String, $type: String, $limit: Int, $offset: Int) {
    transactions(month: $month, category: $category, type: $type, limit: $limit, offset: $offset) {
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
      createdAt
    }
    categories {
      INCOME {
        name
        icon
        color
      }
      EXPENSE {
        name
        icon
        color
      }
    }
  }
`;

const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

const BULK_DELETE_TRANSACTIONS = gql`
  mutation BulkDeleteTransactions($ids: [ID!]!) {
    bulkDeleteTransactions(ids: $ids)
  }
`;

const Transactions = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [filters, setFilters] = useState({
    month: '',
    category: '',
    type: ''
  });

  const { data, loading, error, refetch } = useQuery(GET_TRANSACTIONS, {
    variables: { ...filters, limit: 100 }
  });

  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);
  const [bulkDeleteTransactions] = useMutation(BULK_DELETE_TRANSACTIONS);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTransaction(null);
    refetch();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction({
          variables: { id },
          refetchQueries: ['GetTransactions']
        });
      } catch (error) {
        alert('Failed to delete transaction: ' + error.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTransactions.size} transactions?`)) {
      try {
        await bulkDeleteTransactions({
          variables: { ids: Array.from(selectedTransactions) },
          refetchQueries: ['GetTransactions']
        });
        setSelectedTransactions(new Set());
      } catch (error) {
        alert('Failed to delete transactions: ' + error.message);
      }
    }
  };

  const handleSelectTransaction = (id) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    }
  };

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
    
    return type === 'INCOME' ? `+${formatted}` : `-${formatted}`;
  };

  const getCategoryIcon = (categoryName, type) => {
    if (!data?.categories) return '📦';
    const categories = data.categories[type] || [];
    const category = categories.find(cat => cat.name === categoryName);
    return category?.icon || '📦';
  };

  const getCategoryColor = (categoryName, type) => {
    if (!data?.categories) return '#6b7280';
    const categories = data.categories[type] || [];
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#6b7280';
  };

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error) return <div className="error">Error loading transactions: {error.message}</div>;

  const transactions = data?.transactions || [];

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h2>Transactions</h2>
        <div className="page-actions">
          {selectedTransactions.size > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bulk-delete-button"
            >
              Delete {selectedTransactions.size} selected
            </button>
          )}
          <button onClick={handleAddTransaction} className="add-button">
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="monthFilter">Month:</label>
            <input
              type="month"
              id="monthFilter"
              value={filters.month}
              onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="typeFilter">Type:</label>
            <select
              id="typeFilter"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="categoryFilter">Category:</label>
            <select
              id="categoryFilter"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {data?.categories?.EXPENSE?.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
              {data?.categories?.INCOME?.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => setFilters({ month: '', category: '', type: '' })}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found. Add your first transaction to get started!</p>
            <button onClick={handleAddTransaction}>Add Transaction</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id} className={`transaction-row ${transaction.type.toLowerCase()}`}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                      />
                    </td>
                    <td className="date-cell">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="description-cell">
                      <div className="transaction-description">
                        <div className="merchant">{transaction.merchant || 'N/A'}</div>
                        {transaction.notes && (
                          <div className="notes">{transaction.notes}</div>
                        )}
                        {transaction.tags.length > 0 && (
                          <div className="tags">
                            {transaction.tags.map(tag => (
                              <span key={tag} className="tag">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="category-cell">
                      <div className="category" style={{ color: getCategoryColor(transaction.category, transaction.type) }}>
                        <span className="category-icon">
                          {getCategoryIcon(transaction.category, transaction.type)}
                        </span>
                        <div>
                          <div className="category-name">{transaction.category}</div>
                          {transaction.subcategory && (
                            <div className="subcategory">{transaction.subcategory}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="payment-cell">
                      {transaction.paymentMethod?.replace('_', ' ') || 'N/A'}
                    </td>
                    <td className={`amount-cell ${transaction.type.toLowerCase()}`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="edit-button"
                        title="Edit transaction"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="delete-button"
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TransactionForm
              transaction={editingTransaction}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;