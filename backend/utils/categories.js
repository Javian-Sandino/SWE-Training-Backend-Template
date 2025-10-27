// backend/utils/categories.js
// Predefined categories for transactions with icons and colors

const EXPENSE_CATEGORIES = [
  {
    name: 'Food & Dining',
    subcategories: ['Restaurants', 'Groceries', 'Fast Food', 'Coffee & Tea', 'Delivery'],
    icon: '🍽️',
    color: '#f59e0b'
  },
  {
    name: 'Transportation',
    subcategories: ['Gas', 'Public Transit', 'Uber/Lyft', 'Parking', 'Car Maintenance'],
    icon: '🚗',
    color: '#3b82f6'
  },
  {
    name: 'Shopping',
    subcategories: ['Clothing', 'Electronics', 'Home & Garden', 'Personal Care', 'Gifts'],
    icon: '🛍️',
    color: '#ec4899'
  },
  {
    name: 'Entertainment',
    subcategories: ['Movies', 'Streaming', 'Games', 'Concerts', 'Sports'],
    icon: '🎬',
    color: '#8b5cf6'
  },
  {
    name: 'Bills & Utilities',
    subcategories: ['Rent/Mortgage', 'Electricity', 'Water', 'Internet', 'Phone', 'Insurance'],
    icon: '📄',
    color: '#ef4444'
  },
  {
    name: 'Healthcare',
    subcategories: ['Doctor', 'Pharmacy', 'Dentist', 'Health Insurance', 'Fitness'],
    icon: '🏥',
    color: '#10b981'
  },
  {
    name: 'Education',
    subcategories: ['Tuition', 'Books', 'Online Courses', 'Supplies'],
    icon: '🎓',
    color: '#6366f1'
  },
  {
    name: 'Travel',
    subcategories: ['Flights', 'Hotels', 'Vacation', 'Business Travel'],
    icon: '✈️',
    color: '#06b6d4'
  },
  {
    name: 'Personal Care',
    subcategories: ['Haircut', 'Spa', 'Gym', 'Beauty Products'],
    icon: '💆',
    color: '#84cc16'
  },
  {
    name: 'Other',
    subcategories: ['Miscellaneous', 'Cash Withdrawal', 'Fees'],
    icon: '📦',
    color: '#6b7280'
  }
];

const INCOME_CATEGORIES = [
  {
    name: 'Salary',
    subcategories: ['Monthly Salary', 'Bonus', 'Overtime'],
    icon: '💼',
    color: '#10b981'
  },
  {
    name: 'Freelance',
    subcategories: ['Consulting', 'Project Work', 'Contract'],
    icon: '💻',
    color: '#3b82f6'
  },
  {
    name: 'Investment',
    subcategories: ['Stocks', 'Dividends', 'Interest', 'Real Estate'],
    icon: '📈',
    color: '#059669'
  },
  {
    name: 'Business',
    subcategories: ['Revenue', 'Sales', 'Services'],
    icon: '🏢',
    color: '#dc2626'
  },
  {
    name: 'Other Income',
    subcategories: ['Gifts', 'Refunds', 'Cashback', 'Side Hustle'],
    icon: '💰',
    color: '#f59e0b'
  }
];

// Helper functions
function getAllCategories() {
  return {
    INCOME: INCOME_CATEGORIES,
    EXPENSE: EXPENSE_CATEGORIES
  };
}

function getCategoryByName(type, categoryName) {
  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.find(cat => cat.name === categoryName);
}

function getAllCategoryNames(type) {
  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.map(cat => cat.name);
}

function getSubcategoriesForCategory(type, categoryName) {
  const category = getCategoryByName(type, categoryName);
  return category ? category.subcategories : [];
}

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getAllCategories,
  getCategoryByName,
  getAllCategoryNames,
  getSubcategoriesForCategory
};