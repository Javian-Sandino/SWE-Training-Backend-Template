// backend/graphql/resolvers/index.js
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Budget = require('../../models/Budget');
const { generateToken } = require('../../utils/auth');
const { getAllCategories, getSubcategoriesForCategory } = require('../../utils/categories');
const { GraphQLError } = require('graphql');
const mongoose = require('mongoose');

// Helper function to check if user is authenticated
function requireAuth(user) {
    if (!user) {
        throw new GraphQLError('You must be logged in to perform this action', {
            extensions: { code: 'UNAUTHENTICATED' }
        });
    }
    return user;
}

// Helper function to get date range for month
function getMonthDateRange(monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return { start, end };
}

module.exports = {
        Query: {
            me: async (_, __, { user }) => {
                requireAuth(user);
                return user;
            },

            // Transaction queries
            transactions: async (_, args, { user }) => {
                requireAuth(user);
                const filter = { userId: user.id };
                
                if (args.category) filter.category = args.category;
                if (args.type) filter.type = args.type;
                if (args.tags && args.tags.length > 0) {
                    filter.tags = { $in: args.tags };
                }
                if (args.month) {
                    const { start, end } = getMonthDateRange(args.month);
                    filter.date = { $gte: start, $lte: end };
                }
                
                try {
                    const query = Transaction.find(filter).sort({ date: -1 });
                    if (args.limit) query.limit(args.limit);
                    if (args.offset) query.skip(args.offset);
                    
                    const docs = await query.lean();
                    return docs.map(d => ({ 
                        id: d._id.toString(), 
                        ...d,
                        tags: d.tags || [],
                        paymentMethod: d.paymentMethod || 'other'
                    }));
                } catch (err) {
                    console.error('Failed to fetch transactions from DB:', err.message || err);
                    return [];
                }
            },

            transaction: async (_, { id }, { user }) => {
                requireAuth(user);
                try {
                    const doc = await Transaction.findOne({ _id: id, userId: user.id }).lean();
                    return doc ? { 
                        id: doc._id.toString(), 
                        ...doc,
                        tags: doc.tags || [],
                        paymentMethod: doc.paymentMethod || 'other'
                    } : null;
                } catch (err) {
                    console.error('Failed to fetch transaction:', err.message || err);
                    return null;
                }
            },

            // Budget queries
            budgets: async (_, args, { user }) => {
                requireAuth(user);
                const filter = { userId: user.id };
                if (args.month) filter.month = args.month;
                
                try {
                    const docs = await Budget.find(filter).lean();
                    return docs.map(d => ({ 
                        id: d._id.toString(), 
                        ...d,
                        warningThreshold: d.warningThreshold || 80,
                        criticalThreshold: d.criticalThreshold || 100,
                        allowRollover: d.allowRollover || false,
                        rolloverAmount: d.rolloverAmount || 0,
                        isAutoAdjust: d.isAutoAdjust || false,
                        autoAdjustPercentage: d.autoAdjustPercentage || 0
                    }));
                } catch (err) {
                    console.error('Failed to fetch budgets from DB:', err.message || err);
                    return [];
                }
            },

            budget: async (_, { id }, { user }) => {
                requireAuth(user);
                try {
                    const doc = await Budget.findOne({ _id: id, userId: user.id }).lean();
                    return doc ? { 
                        id: doc._id.toString(), 
                        ...doc,
                        warningThreshold: doc.warningThreshold || 80,
                        criticalThreshold: doc.criticalThreshold || 100,
                        allowRollover: doc.allowRollover || false,
                        rolloverAmount: doc.rolloverAmount || 0,
                        isAutoAdjust: doc.isAutoAdjust || false,
                        autoAdjustPercentage: doc.autoAdjustPercentage || 0
                    } : null;
                } catch (err) {
                    console.error('Failed to fetch budget:', err.message || err);
                    return null;
                }
            },

            budgetProgress: async (_, { month }, { user }) => {
                requireAuth(user);
                try {
                    const budgetsWithProgress = await Budget.getBudgetProgress(user.id, month);
                    return budgetsWithProgress.map(budget => ({
                        id: budget._id.toString(),
                        ...budget,
                        warningThreshold: budget.warningThreshold || 80,
                        criticalThreshold: budget.criticalThreshold || 100,
                        allowRollover: budget.allowRollover || false,
                        rolloverAmount: budget.rolloverAmount || 0,
                        isAutoAdjust: budget.isAutoAdjust || false,
                        autoAdjustPercentage: budget.autoAdjustPercentage || 0,
                        progress: budget.progress
                    }));
                } catch (err) {
                    console.error('Failed to fetch budget progress:', err.message || err);
                    return [];
                }
            },

            // Category queries
            categories: () => getAllCategories(),
            
            subcategories: (_, { type, category }) => {
                return getSubcategoriesForCategory(type, category);
            },

            // Analytics queries
            monthlyTrends: async (_, { months = 12 }, { user }) => {
                requireAuth(user);
                try {
                    const trends = await Transaction.getMonthlyTrends(user.id, months);
                    return trends.map(trend => ({
                        year: trend._id.year,
                        month: trend._id.month,
                        type: trend._id.type,
                        total: trend.total,
                        count: trend.count
                    }));
                } catch (err) {
                    console.error('Failed to fetch monthly trends:', err.message || err);
                    return [];
                }
            },

            categoryBreakdown: async (_, { startDate, endDate }, { user }) => {
                requireAuth(user);
                try {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const breakdown = await Transaction.getCategoryBreakdown(user.id, start, end);
                    return breakdown.map(item => ({
                        type: item._id.type,
                        category: item._id.category,
                        total: item.total,
                        count: item.count,
                        avgAmount: item.avgAmount
                    }));
                } catch (err) {
                    console.error('Failed to fetch category breakdown:', err.message || err);
                    return [];
                }
            },

            budgetInsights: async (_, { month }, { user }) => {
                requireAuth(user);
                try {
                    const insights = await Budget.getBudgetInsights(user.id, month);
                    return insights.map(insight => ({
                        month: insight.month,
                        spending: insight.spending.map(spend => ({
                            category: spend._id,
                            total: spend.total,
                            avgTransaction: spend.avgTransaction,
                            count: spend.count
                        }))
                    }));
                } catch (err) {
                    console.error('Failed to fetch budget insights:', err.message || err);
                    return [];
                }
            },

            dashboardStats: async (_, { month }, { user }) => {
                requireAuth(user);
                try {
                    const { start, end } = getMonthDateRange(month);
                    
                    // Get current month stats
                    const currentMonthStats = await Transaction.aggregate([
                        {
                            $match: {
                                userId: new mongoose.Types.ObjectId(user.id),
                                date: { $gte: start, $lte: end }
                            }
                        },
                        {
                            $group: {
                                _id: '$type',
                                total: { $sum: '$amount' }
                            }
                        }
                    ]);

                    let totalIncome = 0;
                    let totalExpenses = 0;
                    
                    currentMonthStats.forEach(stat => {
                        if (stat._id === 'INCOME') totalIncome = stat.total;
                        if (stat._id === 'EXPENSE') totalExpenses = stat.total;
                    });

                    // Get top categories
                    const topCategories = await Transaction.getCategoryBreakdown(user.id, start, end);
                    
                    // Get budget utilization
                    const budgets = await Budget.getBudgetProgress(user.id, month);
                    const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
                    const budgetUtilization = totalBudgeted > 0 ? (totalExpenses / totalBudgeted) * 100 : 0;

                    return {
                        totalIncome,
                        totalExpenses,
                        netIncome: totalIncome - totalExpenses,
                        budgetUtilization,
                        topCategories: topCategories.slice(0, 5).map(item => ({
                            type: item._id.type,
                            category: item._id.category,
                            total: item.total,
                            count: item.count,
                            avgAmount: item.avgAmount
                        })),
                        monthlyComparison: 0 // TODO: Compare with previous month
                    };
                } catch (err) {
                    console.error('Failed to fetch dashboard stats:', err.message || err);
                    throw new GraphQLError('Failed to fetch dashboard statistics');
                }
            },

            spendingTrends: async (_, { category, months = 6 }, { user }) => {
                requireAuth(user);
                try {
                    const startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - months);
                    
                    const matchFilter = {
                        userId: new mongoose.Types.ObjectId(user.id),
                        type: 'EXPENSE',
                        date: { $gte: startDate }
                    };
                    
                    if (category) matchFilter.category = category;
                    
                    const trends = await Transaction.aggregate([
                        { $match: matchFilter },
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' }
                                },
                                total: { $sum: '$amount' },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { '_id.year': 1, '_id.month': 1 } }
                    ]);
                    
                    return trends.map(trend => ({
                        year: trend._id.year,
                        month: trend._id.month,
                        type: 'EXPENSE',
                        total: trend.total,
                        count: trend.count
                    }));
                } catch (err) {
                    console.error('Failed to fetch spending trends:', err.message || err);
                    return [];
                }
            },

            budgetPerformance: async (_, { months = 6 }, { user }) => {
                requireAuth(user);
                try {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - months);
                    
                    // Get all budgets in the date range
                    const budgets = await Budget.find({
                        userId: user.id,
                        month: {
                            $gte: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
                            $lte: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`
                        }
                    }).lean();

                    // For each budget, calculate progress
                    const budgetsWithProgress = [];
                    for (const budget of budgets) {
                        const progress = await Budget.getBudgetProgress(user.id, budget.month);
                        const budgetProgress = progress.find(p => p._id.toString() === budget._id.toString());
                        budgetsWithProgress.push({
                            id: budget._id.toString(),
                            ...budget,
                            progress: budgetProgress?.progress || {
                                spent: 0,
                                remaining: budget.limit,
                                percentage: 0,
                                alert: 'safe',
                                isOverBudget: false
                            }
                        });
                    }
                    
                    return budgetsWithProgress;
                } catch (err) {
                    console.error('Failed to fetch budget performance:', err.message || err);
                    return [];
                }
            }
        },

        Mutation: {
                register: async (_, { input }) => {
                    try {
                        // Check if user already exists
                        const existingUser = await User.findOne({
                            $or: [{ email: input.email }, { username: input.username }]
                        });
                        
                        if (existingUser) {
                            throw new GraphQLError('User with this email or username already exists', {
                                extensions: { code: 'BAD_USER_INPUT' }
                            });
                        }

                        // Create new user (password will be hashed by pre-save hook)
                        const user = new User({
                            username: input.username,
                            email: input.email,
                            passwordHash: input.password, // Will be hashed by pre-save hook
                            profile: input.profile
                        });
                        
                        const saved = await user.save();
                        const token = generateToken(saved._id);
                        
                        return {
                            token,
                            user: { id: saved._id.toString(), ...saved.toObject() }
                        };
                    } catch (err) {
                        if (err instanceof GraphQLError) throw err;
                        console.error('Registration error:', err);
                        throw new GraphQLError('Registration failed', {
                            extensions: { code: 'INTERNAL_SERVER_ERROR' }
                        });
                    }
                },
                login: async (_, { input }) => {
                    try {
                        // Find user by email
                        const user = await User.findOne({ email: input.email });
                        
                        if (!user) {
                            throw new GraphQLError('Invalid email or password', {
                                extensions: { code: 'BAD_USER_INPUT' }
                            });
                        }

                        // Check password
                        const isValidPassword = await user.comparePassword(input.password);
                        
                        if (!isValidPassword) {
                            throw new GraphQLError('Invalid email or password', {
                                extensions: { code: 'BAD_USER_INPUT' }
                            });
                        }

                        const token = generateToken(user._id);
                        
                        return {
                            token,
                            user: { id: user._id.toString(), ...user.toObject() }
                        };
                    } catch (err) {
                        if (err instanceof GraphQLError) throw err;
                        console.error('Login error:', err);
                        throw new GraphQLError('Login failed', {
                            extensions: { code: 'INTERNAL_SERVER_ERROR' }
                        });
                    }
                },
                createUser: async (_, { input }, { user }) => {
                    requireAuth(user);
                    // Only allow admins to create users directly
                    if (user.role !== 'admin') {
                        throw new GraphQLError('Access denied: Admin role required', {
                            extensions: { code: 'FORBIDDEN' }
                        });
                    }
                    const newUser = new User(input);
                    const saved = await newUser.save();
                    const d = saved.toObject();
                    return { id: d._id.toString(), ...d };
                },
                createTransaction: async (_, { input }, { user }) => {
                    requireAuth(user);
                    const tx = new Transaction({
                        ...input,
                        userId: user.id,
                        date: new Date(input.date)
                    });
                    const saved = await tx.save();
                    const d = saved.toObject();
                    return { 
                        id: d._id.toString(), 
                        ...d,
                        tags: d.tags || [],
                        paymentMethod: d.paymentMethod || 'other'
                    };
                },
                createBudget: async (_, { input }, { user }) => {
                    requireAuth(user);
                    try {
                        const b = new Budget({
                            ...input,
                            userId: user.id
                        });
                        const saved = await b.save();
                        const d = saved.toObject();
                        return { id: d._id.toString(), ...d };
                    } catch (err) {
                        if (err.code === 11000) {
                            throw new GraphQLError('Budget for this category and month already exists', {
                                extensions: { code: 'BAD_USER_INPUT' }
                            });
                        }
                        console.error('Failed to create budget:', err.message || err);
                        throw new GraphQLError('Failed to create budget');
                    }
                },
                
                // Transaction mutations
                updateTransaction: async (_, { id, input }, { user }) => {
                    requireAuth(user);
                    try {
                        const updated = await Transaction.findOneAndUpdate(
                            { _id: id, userId: user.id },
                            { ...input, date: input.date ? new Date(input.date) : undefined },
                            { new: true, runValidators: true }
                        ).lean();
                        
                        if (!updated) {
                            throw new GraphQLError('Transaction not found', {
                                extensions: { code: 'NOT_FOUND' }
                            });
                        }
                        
                        return { 
                            id: updated._id.toString(), 
                            ...updated,
                            tags: updated.tags || [],
                            paymentMethod: updated.paymentMethod || 'other'
                        };
                    } catch (err) {
                        if (err instanceof GraphQLError) throw err;
                        console.error('Failed to update transaction:', err.message || err);
                        throw new GraphQLError('Failed to update transaction');
                    }
                },
                
                deleteTransaction: async (_, { id }, { user }) => {
                    requireAuth(user);
                    try {
                        const res = await Transaction.deleteOne({ _id: id, userId: user.id });
                        return res.deletedCount === 1;
                    } catch (err) {
                        console.error('Failed to delete transaction:', err.message || err);
                        return false;
                    }
                },
                
                duplicateTransaction: async (_, { id, newDate }, { user }) => {
                    requireAuth(user);
                    try {
                        const original = await Transaction.findOne({ _id: id, userId: user.id }).lean();
                        if (!original) {
                            throw new GraphQLError('Transaction not found', {
                                extensions: { code: 'NOT_FOUND' }
                            });
                        }
                        
                        const duplicate = new Transaction({
                            ...original,
                            _id: undefined,
                            date: newDate ? new Date(newDate) : new Date(),
                            createdAt: undefined,
                            updatedAt: undefined
                        });
                        
                        const saved = await duplicate.save();
                        const d = saved.toObject();
                        return { 
                            id: saved._id.toString(), 
                            ...d,
                            tags: d.tags || [],
                            paymentMethod: d.paymentMethod || 'other'
                        };
                    } catch (err) {
                        if (err instanceof GraphQLError) throw err;
                        console.error('Failed to duplicate transaction:', err.message || err);
                        throw new GraphQLError('Failed to duplicate transaction');
                    }
                },
                
                // Budget mutations
                updateBudget: async (_, { id, input }, { user }) => {
                    requireAuth(user);
                    try {
                        const updated = await Budget.findOneAndUpdate(
                            { _id: id, userId: user.id },
                            input,
                            { new: true, runValidators: true }
                        ).lean();
                        
                        if (!updated) {
                            throw new GraphQLError('Budget not found', {
                                extensions: { code: 'NOT_FOUND' }
                            });
                        }
                        
                        return { id: updated._id.toString(), ...updated };
                    } catch (err) {
                        if (err instanceof GraphQLError) throw err;
                        console.error('Failed to update budget:', err.message || err);
                        throw new GraphQLError('Failed to update budget');
                    }
                },
                
                deleteBudget: async (_, { id }, { user }) => {
                    requireAuth(user);
                    try {
                        const res = await Budget.deleteOne({ _id: id, userId: user.id });
                        return res.deletedCount === 1;
                    } catch (err) {
                        console.error('Failed to delete budget:', err.message || err);
                        return false;
                    }
                },
                
                copyBudgetToNextMonth: async (_, { month, categories }, { user }) => {
                    requireAuth(user);
                    try {
                        const [year, monthNum] = month.split('-').map(Number);
                        const nextMonth = monthNum === 12 ? 
                            `${year + 1}-01` : 
                            `${year}-${String(monthNum + 1).padStart(2, '0')}`;
                        
                        const filter = { userId: user.id, month };
                        if (categories && categories.length > 0) {
                            filter.category = { $in: categories };
                        }
                        
                        const budgets = await Budget.find(filter).lean();
                        const newBudgets = [];
                        
                        for (const budget of budgets) {
                            try {
                                const newBudget = new Budget({
                                    ...budget,
                                    _id: undefined,
                                    month: nextMonth,
                                    createdAt: undefined,
                                    updatedAt: undefined
                                });
                                
                                const saved = await newBudget.save();
                                newBudgets.push({ id: saved._id.toString(), ...saved.toObject() });
                            } catch (err) {
                                // Skip duplicates (budget already exists for next month)
                                if (err.code !== 11000) {
                                    console.error('Failed to copy budget:', err);
                                }
                            }
                        }
                        
                        return newBudgets;
                    } catch (err) {
                        console.error('Failed to copy budgets to next month:', err.message || err);
                        throw new GraphQLError('Failed to copy budgets to next month');
                    }
                },
                
                // Bulk operations
                bulkDeleteTransactions: async (_, { ids }, { user }) => {
                    requireAuth(user);
                    try {
                        const res = await Transaction.deleteMany({ 
                            _id: { $in: ids }, 
                            userId: user.id 
                        });
                        return res.deletedCount;
                    } catch (err) {
                        console.error('Failed to bulk delete transactions:', err.message || err);
                        throw new GraphQLError('Failed to delete transactions');
                    }
                },
                
                bulkUpdateTransactionCategory: async (_, { ids, category, subcategory }, { user }) => {
                    requireAuth(user);
                    try {
                        const updateData = { category };
                        if (subcategory) updateData.subcategory = subcategory;
                        
                        const res = await Transaction.updateMany(
                            { _id: { $in: ids }, userId: user.id },
                            updateData
                        );
                        return res.modifiedCount;
                    } catch (err) {
                        console.error('Failed to bulk update transaction categories:', err.message || err);
                        throw new GraphQLError('Failed to update transaction categories');
                    }
                }
        }
};

