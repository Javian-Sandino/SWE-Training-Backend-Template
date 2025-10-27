// backend/models/Transaction.js
// Transaction model for income/expense tracking.

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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

module.exports = mongoose.model('Transaction', TransactionSchema);
