// backend/models/Budget.js
// Enhanced budget model with progress tracking and alerts.

const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { 
      type: String, 
      required: true, 
      index: true,
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
    },
    category: { 
      type: String, 
      required: true, 
      index: true 
    },
    limit: { 
      type: Number, 
      required: true,
      min: [0.01, 'Budget limit must be greater than 0']
    },
    // Alert thresholds
    warningThreshold: {
      type: Number,
      default: 80,
      min: [50, 'Warning threshold must be at least 50%'],
      max: [100, 'Warning threshold cannot exceed 100%']
    },
    criticalThreshold: {
      type: Number,
      default: 100,
      min: [80, 'Critical threshold must be at least 80%'],
      max: [150, 'Critical threshold cannot exceed 150%']
    },
    // Rollover settings
    allowRollover: {
      type: Boolean,
      default: false
    },
    rolloverAmount: {
      type: Number,
      default: 0
    },
    notes: { 
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    // Auto-adjust settings
    isAutoAdjust: {
      type: Boolean,
      default: false
    },
    autoAdjustPercentage: {
      type: Number,
      min: [-50, 'Auto-adjust cannot decrease more than 50%'],
      max: [100, 'Auto-adjust cannot increase more than 100%'],
      default: 0
    }
  },
  { 
    timestamps: true,
    indexes: [
      { userId: 1, month: 1 },
      { userId: 1, category: 1 },
      { userId: 1, month: 1, category: 1 }
    ]
  }
);

// Virtual for budget status calculation
BudgetSchema.virtual('status').get(function() {
  // This will be populated by the resolver with actual spending data
  return {
    spent: 0,
    remaining: this.limit,
    percentage: 0,
    alert: 'safe'
  };
});

// Static method to get budget progress for a user
BudgetSchema.statics.getBudgetProgress = async function(userId, month) {
  const Transaction = mongoose.model('Transaction');
  
  // Get all budgets for the month
  const budgets = await this.find({ userId, month }).lean();
  
  // Get spending for each category in the month
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);
  
  const spending = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'EXPENSE',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Create spending map
  const spendingMap = {};
  spending.forEach(item => {
    spendingMap[item._id] = item.total;
  });
  
  // Calculate progress for each budget
  return budgets.map(budget => {
    const spent = spendingMap[budget.category] || 0;
    const remaining = Math.max(0, budget.limit - spent);
    const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
    
    let alert = 'safe';
    if (percentage >= budget.criticalThreshold) {
      alert = 'critical';
    } else if (percentage >= budget.warningThreshold) {
      alert = 'warning';
    }
    
    return {
      ...budget,
      progress: {
        spent,
        remaining,
        percentage,
        alert,
        isOverBudget: spent > budget.limit
      }
    };
  });
};



// Compound unique index to prevent duplicate budgets
BudgetSchema.index({ userId: 1, month: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
