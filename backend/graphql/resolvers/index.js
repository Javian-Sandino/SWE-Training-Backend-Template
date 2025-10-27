// backend/graphql/resolvers/index.js
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Budget = require('../../models/Budget');
const { generateToken } = require('../../utils/auth');
const { GraphQLError } = require('graphql');

// Helper function to check if user is authenticated
function requireAuth(user) {
    if (!user) {
        throw new GraphQLError('You must be logged in to perform this action', {
            extensions: { code: 'UNAUTHENTICATED' }
        });
    }
    return user;
}

module.exports = {
        Query: {
            hello: () => 'Hello from the backend! 🎉',
            me: async (_, __, { user }) => {
                requireAuth(user);
                return user;
            },
            users: async (_, __, { user }) => {
                requireAuth(user);
                // Only allow admins to see all users
                if (user.role !== 'admin') {
                    throw new GraphQLError('Access denied: Admin role required', {
                        extensions: { code: 'FORBIDDEN' }
                    });
                }
                try {
                    const docs = await User.find().lean();
                    return docs.map(d => ({ id: d._id.toString(), ...d }));
                } catch (err) {
                    console.error('Failed to fetch users from DB:', err.message || err);
                    return [];
                }
            },
            transactions: async (_, args, { user }) => {
                requireAuth(user);
                const filter = { userId: user.id };
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
            budgets: async (_, args, { user }) => {
                requireAuth(user);
                const filter = { userId: user.id };
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
                    return { id: d._id.toString(), ...d };
                },
                createBudget: async (_, { input }, { user }) => {
                    requireAuth(user);
                    const b = new Budget({
                        ...input,
                        userId: user.id
                    });
                    const saved = await b.save();
                    const d = saved.toObject();
                    return { id: d._id.toString(), ...d };
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
                }
        }
};

