// frontend/src/components/BudgetDashboard.jsx
import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const GET_BUDGET_PROGRESS = gql`
  query GetBudgetProgress($month: String!) {
    budgetProgress(month: $month) {
      id
      month
      category
      limit
      warningThreshold
      criticalThreshold
      notes
      progress {
        spent
        remaining
        percentage
        alert
        isOverBudget
      }
    }
    categories {
      EXPENSE {
        name
        icon
        color
      }
    }
  }
`;

const CREATE_BUDGET = gql`
  mutation CreateBudget($input: CreateBudgetInput!) {
    createBudget(input: $input) {
      id
      month
      category
      limit
      warningThreshold
      criticalThreshold
    }
  }
`;

const UPDATE_BUDGET = gql`
  mutation UpdateBudget($id: ID!, $input: UpdateBudgetInput!) {
    updateBudget(id: $id, input: $input) {
      id
      month
      category
      limit
      warningThreshold
      criticalThreshold
    }
  }
`;

const DELETE_BUDGET = gql`
  mutation DeleteBudget($id: ID!) {
    deleteBudget(id: $id)
  }
`;

const BudgetDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_BUDGET_PROGRESS, {
    variables: { month: selectedMonth }
  });

  const [createBudget] = useMutation(CREATE_BUDGET);
  const [updateBudget] = useMutation(UPDATE_BUDGET);
  const [deleteBudget] = useMutation(DELETE_BUDGET);

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setShowForm(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget({
          variables: { id },
          refetchQueries: ['GetBudgetProgress']
        });
      } catch (error) {
        alert('Failed to delete budget: ' + error.message);
      }
    }
  };

  const getProgressBarColor = (alert) => {
    switch (alert) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getAlertMessage = (budget) => {
    const { progress } = budget;
    if (progress.isOverBudget) {
      const overspend = progress.spent - budget.limit;
      return `Over budget by $${overspend.toFixed(2)}`;
    }
    if (progress.alert === 'critical') {
      return `Critical: ${progress.percentage}% used`;
    }
    if (progress.alert === 'warning') {
      return `Warning: ${progress.percentage}% used`;
    }
    return `On track: ${progress.percentage}% used`;
  };

  const getCategoryIcon = (categoryName) => {
    if (!data?.categories?.EXPENSE) return '📦';
    const category = data.categories.EXPENSE.find(cat => cat.name === categoryName);
    return category?.icon || '📦';
  };

  const getCategoryColor = (categoryName) => {
    if (!data?.categories?.EXPENSE) return '#6b7280';
    const category = data.categories.EXPENSE.find(cat => cat.name === categoryName);
    return category?.color || '#6b7280';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading budget data...</div>;
  if (error) return <div className="error">Error loading budgets: {error.message}</div>;

  const budgets = data?.budgetProgress || [];
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.progress.spent, 0);
  const overallProgress = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="budget-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Budget Dashboard</h2>
        <div className="header-controls">
          <div className="month-selector">
            <label htmlFor="monthSelect">Month:</label>
            <input
              type="month"
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <button onClick={handleCreateBudget} className="create-budget-button">
            + Add Budget
          </button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="budget-summary">
        <div className="summary-card">
          <h3>Monthly Overview</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Budgeted</span>
              <span className="stat-value">{formatCurrency(totalBudgeted)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value spent">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Remaining</span>
              <span className="stat-value remaining">{formatCurrency(totalBudgeted - totalSpent)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Overall Progress</span>
              <span className="stat-value">{overallProgress}%</span>
            </div>
          </div>
          <div className="overall-progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${Math.min(overallProgress, 100)}%`,
                backgroundColor: overallProgress > 100 ? '#ef4444' : overallProgress > 80 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="budgets-grid">
        {budgets.length === 0 ? (
          <div className="empty-state">
            <h3>No budgets set for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</h3>
            <p>Create your first budget to start tracking your spending!</p>
            <button onClick={handleCreateBudget}>Create Budget</button>
          </div>
        ) : (
          budgets.map(budget => (
            <div key={budget.id} className={`budget-card ${budget.progress.alert}`}>
              <div className="budget-header">
                <div className="category-info">
                  <span className="category-icon" style={{ color: getCategoryColor(budget.category) }}>
                    {getCategoryIcon(budget.category)}
                  </span>
                  <h4>{budget.category}</h4>
                </div>
                <div className="budget-actions">
                  <button
                    onClick={() => handleEditBudget(budget)}
                    className="edit-button"
                    title="Edit budget"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="delete-button"
                    title="Delete budget"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="budget-amounts">
                <div className="amount-row">
                  <span>Spent:</span>
                  <span className="spent-amount">{formatCurrency(budget.progress.spent)}</span>
                </div>
                <div className="amount-row">
                  <span>Budget:</span>
                  <span className="budget-amount">{formatCurrency(budget.limit)}</span>
                </div>
                <div className="amount-row">
                  <span>Remaining:</span>
                  <span className={`remaining-amount ${budget.progress.remaining < 0 ? 'negative' : ''}`}>
                    {formatCurrency(budget.progress.remaining)}
                  </span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-percentage">{budget.progress.percentage}%</span>
                  <span className={`alert-indicator ${budget.progress.alert}`}>
                    {budget.progress.alert === 'critical' && '🚨'}
                    {budget.progress.alert === 'warning' && '⚠️'}
                    {budget.progress.alert === 'safe' && '✅'}
                  </span>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${Math.min(budget.progress.percentage, 100)}%`,
                      backgroundColor: getProgressBarColor(budget.progress.alert)
                    }}
                  />
                  {/* Warning threshold marker */}
                  <div 
                    className="threshold-marker warning"
                    style={{ left: `${budget.warningThreshold}%` }}
                    title={`Warning at ${budget.warningThreshold}%`}
                  />
                  {/* Critical threshold marker */}
                  <div 
                    className="threshold-marker critical"
                    style={{ left: `${budget.criticalThreshold}%` }}
                    title={`Critical at ${budget.criticalThreshold}%`}
                  />
                </div>
                
                <div className="alert-message">
                  {getAlertMessage(budget)}
                </div>
              </div>

              {budget.notes && (
                <div className="budget-notes">
                  <small>{budget.notes}</small>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Budget Form Modal */}
      {showForm && (
        <BudgetFormModal
          budget={editingBudget}
          month={selectedMonth}
          categories={data?.categories?.EXPENSE || []}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

// Budget Form Modal Component
const BudgetFormModal = ({ budget, month, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    limit: budget?.limit?.toString() || '',
    warningThreshold: budget?.warningThreshold?.toString() || '80',
    criticalThreshold: budget?.criticalThreshold?.toString() || '100',
    notes: budget?.notes || ''
  });

  const [createBudget, { loading: creating }] = useMutation(CREATE_BUDGET);
  const [updateBudget, { loading: updating }] = useMutation(UPDATE_BUDGET);

  const isEditing = !!budget;
  const loading = creating || updating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const input = {
        month,
        category: formData.category,
        limit: parseFloat(formData.limit),
        warningThreshold: parseFloat(formData.warningThreshold),
        criticalThreshold: parseFloat(formData.criticalThreshold),
        notes: formData.notes || undefined
      };

      if (isEditing) {
        await updateBudget({
          variables: { id: budget.id, input },
          refetchQueries: ['GetBudgetProgress']
        });
      } else {
        await createBudget({
          variables: { input },
          refetchQueries: ['GetBudgetProgress']
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="budget-form">
          <h3>{isEditing ? 'Edit Budget' : 'Create Budget'}</h3>

          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
              disabled={isEditing}
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="limit">Budget Limit:</label>
            <input
              type="number"
              id="limit"
              value={formData.limit}
              onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="warningThreshold">Warning at (%):</label>
              <input
                type="number"
                id="warningThreshold"
                value={formData.warningThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, warningThreshold: e.target.value }))}
                min="50"
                max="100"
                placeholder="80"
              />
            </div>

            <div className="form-group">
              <label htmlFor="criticalThreshold">Critical at (%):</label>
              <input
                type="number"
                id="criticalThreshold"
                value={formData.criticalThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, criticalThreshold: e.target.value }))}
                min="80"
                max="150"
                placeholder="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes:</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes about this budget..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Budget' : 'Create Budget')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetDashboard;