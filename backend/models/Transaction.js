// backend/models/Transaction.js
// Enhanced transaction model for income/expense tracking with categorization.

const mongoose = require('mongoose');
const { getAllCategoryNames } = require('../utils/categories');

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { 
      type: String, 
      enum: ['INCOME', 'EXPENSE'], 
      required: true,
      index: true
    },
    amount: { 
      type: Number, 
      required: true,
      min: [0.01, 'Amount must be greater than 0']
    },
    date: { 
      type: Date, 
      required: true,
      index: true
    },
    merchant: { 
      type: String,
      trim: true,
      maxlength: [100, 'Merchant name cannot exceed 100 characters']
    },
    category: { 
      type: String, 
      required: true,
      index: true,
      validate: {
        validator: function(value) {
          const validCategories = getAllCategoryNames(this.type);
          return validCategories.includes(value);
        },
        message: 'Invalid category for transaction type'
      }
    },
    subcategory: {
      type: String,
      index: true,
      trim: true
    },
    notes: { 
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    tags: {
      type: [{ 
        type: String, 
        index: true,
        trim: true,
        lowercase: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
      }],
      default: []
    },
    // Enhanced metadata
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPeriod: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      required: function() { return this.isRecurring; }
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'check', 'other'],
      default: 'other'
    }
  },
  { 
    timestamps: true,
    // Add compound indexes for better query performance
    indexes: [
      { userId: 1, date: -1 },
      { userId: 1, type: 1, category: 1 },
      { userId: 1, date: -1, type: 1 }
    ]
  }
);

// Add virtual for month-year grouping
TransactionSchema.virtual('monthYear').get(function() {
  const date = new Date(this.date);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
});

// Pre-save middleware for validation and normalization
TransactionSchema.pre('save', function(next) {
  // Normalize tags
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag.trim().length > 0);
  }
  
  // Auto-generate merchant from category if not provided
  if (!this.merchant && this.category) {
    this.merchant = this.category;
  }
  
  next();
});



module.exports = mongoose.model('Transaction', TransactionSchema);
