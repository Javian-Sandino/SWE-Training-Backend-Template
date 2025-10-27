// frontend/src/components/AnalyticsDashboard.jsx
import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($month: String!) {
    dashboardStats(month: $month) {
      totalIncome
      totalExpenses
      netIncome
      budgetUtilization
      topCategories {
        type
        category
        total
        count
        avgAmount
      }
    }
  }
`;

const GET_MONTHLY_TRENDS = gql`
  query GetMonthlyTrends($months: Int!) {
    monthlyTrends(months: $months) {
      year
      month
      type
      total
      count
    }
  }
`;

const GET_CATEGORY_BREAKDOWN = gql`
  query GetCategoryBreakdown($startDate: String!, $endDate: String!) {
    categoryBreakdown(startDate: $startDate, endDate: $endDate) {
      type
      category
      total
      count
      avgAmount
    }
    categories {
      EXPENSE {
        name
        icon
        color
      }
      INCOME {
        name
        icon
        color
      }
    }
  }
`;

const AnalyticsDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [trendsMonths, setTrendsMonths] = useState(6);

  // Calculate date range for category breakdown
  const monthStart = startOfMonth(new Date(selectedMonth + '-01'));
  const monthEnd = endOfMonth(monthStart);

  const { data: statsData, loading: statsLoading } = useQuery(GET_DASHBOARD_STATS, {
    variables: { month: selectedMonth }
  });

  const { data: trendsData, loading: trendsLoading } = useQuery(GET_MONTHLY_TRENDS, {
    variables: { months: trendsMonths }
  });

  const { data: categoryData, loading: categoryLoading } = useQuery(GET_CATEGORY_BREAKDOWN, {
    variables: {
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString()
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryColor = (categoryName, type) => {
    if (!categoryData?.categories) return '#8884d8';
    const categories = categoryData.categories[type] || [];
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#8884d8';
  };

  // Process monthly trends data for charts
  const processMonthlyTrends = () => {
    if (!trendsData?.monthlyTrends) return [];

    const monthlyData = {};
    
    trendsData.monthlyTrends.forEach(trend => {
      const monthKey = `${trend.year}-${String(trend.month).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: format(new Date(trend.year, trend.month - 1), 'MMM yyyy'),
          income: 0,
          expenses: 0
        };
      }
      
      if (trend.type === 'INCOME') {
        monthlyData[monthKey].income = trend.total;
      } else {
        monthlyData[monthKey].expenses = trend.total;
      }
    });

    return Object.values(monthlyData).sort((a, b) => {
      return new Date(a.month + ' 1') - new Date(b.month + ' 1');
    });
  };

  // Process category data for pie charts
  const processExpenseCategories = () => {
    if (!categoryData?.categoryBreakdown) return [];
    
    return categoryData.categoryBreakdown
      .filter(item => item.type === 'EXPENSE')
      .map(item => ({
        name: item.category,
        value: item.total,
        color: getCategoryColor(item.category, 'EXPENSE')
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  };

  const processIncomeCategories = () => {
    if (!categoryData?.categoryBreakdown) return [];
    
    return categoryData.categoryBreakdown
      .filter(item => item.type === 'INCOME')
      .map(item => ({
        name: item.category,
        value: item.total,
        color: getCategoryColor(item.category, 'INCOME')
      }))
      .sort((a, b) => b.value - a.value);
  };

  const monthlyTrendsData = processMonthlyTrends();
  const expenseCategories = processExpenseCategories();
  const incomeCategories = processIncomeCategories();

  const stats = statsData?.dashboardStats;

  if (statsLoading || trendsLoading || categoryLoading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <div className="header-controls">
          <div className="month-selector">
            <label htmlFor="monthSelect">Current Month:</label>
            <input
              type="month"
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="trends-selector">
            <label htmlFor="trendsSelect">Trends Period:</label>
            <select
              id="trendsSelect"
              value={trendsMonths}
              onChange={(e) => setTrendsMonths(parseInt(e.target.value))}
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="metrics-grid">
          <div className="metric-card income">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <h3>Total Income</h3>
              <div className="metric-value">{formatCurrency(stats.totalIncome)}</div>
            </div>
          </div>
          
          <div className="metric-card expense">
            <div className="metric-icon">💸</div>
            <div className="metric-content">
              <h3>Total Expenses</h3>
              <div className="metric-value">{formatCurrency(stats.totalExpenses)}</div>
            </div>
          </div>
          
          <div className={`metric-card net ${stats.netIncome >= 0 ? 'positive' : 'negative'}`}>
            <div className="metric-icon">{stats.netIncome >= 0 ? '📈' : '📉'}</div>
            <div className="metric-content">
              <h3>Net Income</h3>
              <div className="metric-value">{formatCurrency(stats.netIncome)}</div>
            </div>
          </div>
          
          <div className="metric-card budget">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <h3>Budget Usage</h3>
              <div className="metric-value">{stats.budgetUtilization.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Monthly Trends Line Chart */}
        <div className="chart-card wide">
          <h3>Monthly Income vs Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={3}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories Pie Chart */}
        <div className="chart-card">
          <h3>Expense Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Income Categories Bar Chart */}
        <div className="chart-card">
          <h3>Income Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeCategories} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories Table */}
        {stats?.topCategories && (
          <div className="chart-card wide">
            <h3>Top Spending Categories This Month</h3>
            <div className="categories-table">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Transactions</th>
                    <th>Avg Amount</th>
                    <th>% of Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topCategories
                    .filter(cat => cat.type === 'EXPENSE')
                    .map((category, index) => (
                    <tr key={category.category}>
                      <td>
                        <span className="category-name">
                          {category.category}
                        </span>
                      </td>
                      <td className="amount">{formatCurrency(category.total)}</td>
                      <td>{category.count}</td>
                      <td>{formatCurrency(category.avgAmount)}</td>
                      <td>
                        {((category.total / stats.totalExpenses) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h3>Financial Insights</h3>
        <div className="insights-grid">
          {stats && (
            <>
              <div className="insight-card">
                <h4>💡 Spending Pattern</h4>
                <p>
                  {stats.totalExpenses > stats.totalIncome
                    ? `You're spending ${formatCurrency(stats.totalExpenses - stats.totalIncome)} more than you earn this month.`
                    : `Great job! You're saving ${formatCurrency(stats.totalIncome - stats.totalExpenses)} this month.`
                  }
                </p>
              </div>
              
              <div className="insight-card">
                <h4>🎯 Budget Performance</h4>
                <p>
                  {stats.budgetUtilization > 100
                    ? `You're over budget by ${(stats.budgetUtilization - 100).toFixed(1)}%. Consider reviewing your spending.`
                    : stats.budgetUtilization > 80
                    ? `You've used ${stats.budgetUtilization.toFixed(1)}% of your budget. Monitor spending closely.`
                    : `You're on track with ${stats.budgetUtilization.toFixed(1)}% budget utilization.`
                  }
                </p>
              </div>
              
              {stats.topCategories.length > 0 && (
                <div className="insight-card">
                  <h4>📊 Top Expense</h4>
                  <p>
                    Your highest spending category is {stats.topCategories[0]?.category} at{' '}
                    {formatCurrency(stats.topCategories[0]?.total)} ({stats.topCategories[0]?.count} transactions).
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;