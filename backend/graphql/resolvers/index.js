// backend/graphql/resolvers/index.js
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Budget = require('../../models/Budget');

module.exports = {
        Query: {
            hello: () => 'Hello from the backend! 🎉',
            users: async () => {
                try {
                    const docs = await User.find().lean();
                    return docs.map(d => ({ id: d._id.toString(), ...d }));
                } catch (err) {
                    console.error('Failed to fetch users from DB:', err.message || err);
                    return [];
                }
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
                try {
                    const docs = await Transaction.find(filter).sort({ date: -1 }).lean();
                    return docs.map(d => ({ id: d._id.toString(), ...d }));
                } catch (err) {
                    console.error('Failed to fetch transactions from DB:', err.message || err);
                    return [];
                }
            },
            budgets: async (_, args) => {
                const filter = {};
                if (args.month) filter.month = args.month;
                try {
                    const docs = await Budget.find(filter).lean();
                    return docs.map(d => ({ id: d._id.toString(), ...d }));
                } catch (err) {
                    console.error('Failed to fetch budgets from DB:', err.message || err);
                    return [];
                }
            }
        },

        Mutation: {
                createUser: async (_, { input }) => {
                    const user = new User(input);
                    const saved = await user.save();
                    const d = saved.toObject();
                    return { id: d._id.toString(), ...d };
                },
                createTransaction: async (_, { input }) => {
                    const tx = new Transaction({
                        ...input,
                        date: new Date(input.date)
                    });
                    const saved = await tx.save();
                    const d = saved.toObject();
                    return { id: d._id.toString(), ...d };
                },
                createBudget: async (_, { input }) => {
                        const b = new Budget(input);
                                const saved = await b.save();
                                const d = saved.toObject();
                                return { id: d._id.toString(), ...d };
                }
        }
};

