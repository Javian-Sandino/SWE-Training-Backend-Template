// backend/models/Transaction.js
// Transaction model for income/expense tracking.

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    merchant: { type: String },
    category: { type: String, index: true },
    notes: { type: String },
    tags: [{ type: String, index: true }]
  },
  { timestamps: true }
);

// compound index for analytics
TransactionSchema.index({ date: -1, category: 1 });
TransactionSchema.index({ tags: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
