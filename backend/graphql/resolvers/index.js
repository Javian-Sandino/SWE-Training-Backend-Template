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
            budgets: async (_, args) => {
                const filter = {};
                if (args.month) filter.month = args.month;
                const docs = await Budget.find(filter).lean();
                return docs.map(d => ({ id: d._id.toString(), ...d }));
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
        }
};

