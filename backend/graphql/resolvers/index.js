// backend/graphql/resolvers/index.js
const mongoose = require('mongoose');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Budget = require('../../models/Budget');

function ensureDbConnected(){
    // mongoose.connection.readyState === 1 means connected
    if(mongoose.connection.readyState !== 1){
        throw new Error('Database not connected')
    }
}

module.exports = {
        Query: {
            hello: () => 'Hello from the backend! 🎉',
            users: async () => {
                const docs = await User.find().lean();
                return docs.map(d => ({ id: d._id.toString(), ...d }));
            },
            transactions: async (_, args) => {
                const filter = {};
                if (args.category) filter.category = args.category;
                if (args.type) filter.type = args.type;
                if (args.month) {
                    const [year, month] = args.month.split('-').map(Number);
                    const start = new Date(year, month - 1, 1);
                    const end = new Date(year, month, 1);
                    filter.date = { $gte: start, $lt: end };
                }
                const docs = await Transaction.find(filter).sort({ date: -1 }).lean();
                return docs.map(d => ({ id: d._id.toString(), ...d }));
            },
            transactionsPage: async (_, args) => {
                const { page = 1, limit = 20, category, type, month } = args;
                const filter = {};
                if (category) filter.category = category;
                if (type) filter.type = type;
                if (month) {
                    const [year, m] = month.split('-').map(Number);
                    const start = new Date(year, m - 1, 1);
                    const end = new Date(year, m, 1);
                    filter.date = { $gte: start, $lt: end };
                }
                const total = await Transaction.countDocuments(filter);
                const items = await Transaction.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean();
                return { items: items.map(d => ({ id: d._id.toString(), ...d })), total, page, limit };
            },
            budgets: async (_, args) => {
                const filter = {};
                if (args.month) filter.month = args.month;
                const docs = await Budget.find(filter).lean();
                return docs.map(d => ({ id: d._id.toString(), ...d }));
            }
            ,
            budget: async (_, { id }) => {
                const d = await Budget.findById(id).lean();
                if (!d) return null;
                return { id: d._id.toString(), ...d };
            },
            totalsByMonth: async (_, { month }) => {
                // sum of all transactions (income positive, expense negative) for a month
                const [year, m] = month.split('-').map(Number);
                const start = new Date(year, m - 1, 1);
                const end = new Date(year, m, 1);
                const res = await Transaction.aggregate([
                    { $match: { date: { $gte: start, $lt: end } } },
                    { $group: { _id: null, total: { $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', { $multiply: ['$amount', -1] }] } } } }
                ]);
                return res[0]?.total || 0;
            },
            totalsByCategory: async (_, { month }) => {
                const match = {};
                if (month) {
                    const [year, m] = month.split('-').map(Number);
                    const start = new Date(year, m - 1, 1);
                    const end = new Date(year, m, 1);
                    match.date = { $gte: start, $lt: end };
                }
                const res = await Transaction.aggregate([
                    { $match: match },
                    { $group: { _id: '$category', total: { $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', { $multiply: ['$amount', -1] }] } } } },
                    { $project: { category: '$_id', total: 1, _id: 0 } }
                ]);
                return res.map(r => ({ category: r.category, total: r.total }));
            }
        },

        Mutation: {
                createUser: async (_, { input }) => {
                    ensureDbConnected();
                    const user = new User(input);
                    const saved = await user.save();
                    const d = saved.toObject();
                    return { id: d._id.toString(), ...d };
                },
                createTransaction: async (_, { input }) => {
                    ensureDbConnected();
                    const tx = new Transaction({
                        ...input,
                        date: new Date(input.date)
                    });
                    const saved = await tx.save();
                    const d = saved.toObject();
                    return { id: d._id.toString(), ...d };
                },
                createBudget: async (_, { input }) => {
                    ensureDbConnected();
                    const b = new Budget(input);
                    const saved = await b.save();
                    const d = saved.toObject();
                    return { id: d._id.toString(), ...d };
                }
                ,
                updateBudget: async (_, { input }) => {
                    ensureDbConnected();
                    const { id, ...patch } = input;
                    const updated = await Budget.findByIdAndUpdate(id, patch, { new: true }).lean();
                    if (!updated) throw new Error('Budget not found');
                    return { id: updated._id.toString(), ...updated };
                },
                deleteBudget: async (_, { id }) => {
                    ensureDbConnected();
                    const deleted = await Budget.findByIdAndDelete(id);
                    return !!deleted;
                }
        }
};

