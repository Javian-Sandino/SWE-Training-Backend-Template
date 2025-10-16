// backend/models/Budget.js
// Budget model for monthly category budgets.

const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, index: true }, // e.g. "2025-10"
    category: { type: String, required: true, index: true },
    limit: { type: Number, required: true },
    notes: { type: String }
  },
  { timestamps: true }
);


// compound index to ensure unique monthly budget per category if desired
BudgetSchema.index({ month: 1, category: 1 }, { unique: false });

module.exports = mongoose.model('Budget', BudgetSchema);
