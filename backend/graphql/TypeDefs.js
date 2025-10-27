// backend/graphql/TypeDefs.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
    scalar Date

    type User {
        id: ID!
        username: String!
        email: String!
        role: String
        profile: Profile
        createdAt: Date
        updatedAt: Date
    }

    type Profile {
        name: String
        bio: String
    }

    type Category {
        name: String!
        subcategories: [String!]!
        icon: String!
        color: String!
    }

    type CategoryData {
        INCOME: [Category!]!
        EXPENSE: [Category!]!
    }

    type Location {
        address: String
        city: String
        state: String
        country: String
    }

    type Transaction {
        id: ID!
        userId: ID!
        type: String!
        amount: Float!
        date: Date!
        merchant: String
        category: String!
        subcategory: String
        notes: String
        tags: [String!]!
        isRecurring: Boolean!
        recurringPeriod: String
        location: Location
        paymentMethod: String!
        monthYear: String!
        createdAt: Date
        updatedAt: Date
    }

    type BudgetProgress {
        spent: Float!
        remaining: Float!
        percentage: Int!
        alert: String!
        isOverBudget: Boolean!
    }

    type Budget {
        id: ID!
        userId: ID!
        month: String!
        category: String!
        limit: Float!
        warningThreshold: Float!
        criticalThreshold: Float!
        allowRollover: Boolean!
        rolloverAmount: Float!
        notes: String
        isAutoAdjust: Boolean!
        autoAdjustPercentage: Float!
        progress: BudgetProgress
        createdAt: Date
        updatedAt: Date
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type Query {
        me: User
        
        # Transaction queries
        transactions(category: String, type: String, month: String, tags: [String], limit: Int, offset: Int): [Transaction!]
        transaction(id: ID!): Transaction
        
        # Budget queries
        budgets(month: String): [Budget!]
        budget(id: ID!): Budget
        budgetProgress(month: String!): [Budget!]
        
        # Category queries
        categories: CategoryData!
        subcategories(type: String!, category: String!): [String!]!
    }

    input ProfileInput {
        name: String
        bio: String
    }

    input RegisterInput {
        username: String!
        email: String!
        password: String!
        profile: ProfileInput
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input CreateUserInput {
        username: String!
        email: String!
        passwordHash: String
        role: String
        profile: ProfileInput
    }

    input LocationInput {
        address: String
        city: String
        state: String
        country: String
    }

    input CreateTransactionInput {
        type: String!
        amount: Float!
        date: String!
        merchant: String
        category: String!
        subcategory: String
        notes: String
        tags: [String!]
        isRecurring: Boolean
        recurringPeriod: String
        location: LocationInput
        paymentMethod: String
    }

    input UpdateTransactionInput {
        type: String
        amount: Float
        date: String
        merchant: String
        category: String
        subcategory: String
        notes: String
        tags: [String!]
        isRecurring: Boolean
        recurringPeriod: String
        location: LocationInput
        paymentMethod: String
    }

    input CreateBudgetInput {
        month: String!
        category: String!
        limit: Float!
        warningThreshold: Float
        criticalThreshold: Float
        allowRollover: Boolean
        rolloverAmount: Float
        notes: String
        isAutoAdjust: Boolean
        autoAdjustPercentage: Float
    }

    input UpdateBudgetInput {
        month: String
        category: String
        limit: Float
        warningThreshold: Float
        criticalThreshold: Float
        allowRollover: Boolean
        rolloverAmount: Float
        notes: String
        isAutoAdjust: Boolean
        autoAdjustPercentage: Float
    }

    type Mutation {
        # Authentication
        register(input: RegisterInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload!
        
        # User management
        createUser(input: CreateUserInput!): User!
        
        # Transaction management
        createTransaction(input: CreateTransactionInput!): Transaction!
        updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
        deleteTransaction(id: ID!): Boolean!
        duplicateTransaction(id: ID!, newDate: String): Transaction!
        
        # Budget management
        createBudget(input: CreateBudgetInput!): Budget!
        updateBudget(id: ID!, input: UpdateBudgetInput!): Budget!
        deleteBudget(id: ID!): Boolean!
        copyBudgetToNextMonth(month: String!, categories: [String!]): [Budget!]!
        
        # Bulk operations
        bulkDeleteTransactions(ids: [ID!]!): Int!
        bulkUpdateTransactionCategory(ids: [ID!]!, category: String!, subcategory: String): Int!
    }
`;

module.exports = typeDefs;