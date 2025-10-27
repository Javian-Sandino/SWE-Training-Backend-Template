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

    type Transaction {
        id: ID!
        userId: ID!
        type: String!
        amount: Float!
        date: Date!
        merchant: String
        category: String
        notes: String
        tags: [String]
        createdAt: Date
        updatedAt: Date
    }

    type Budget {
        id: ID!
        userId: ID!
        month: String!
        category: String!
        limit: Float!
        notes: String
        createdAt: Date
        updatedAt: Date
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type Query {
        hello: String
        me: User
        users: [User!]
        transactions(category: String, type: String, month: String): [Transaction!]
        budgets(month: String): [Budget!]
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

    input CreateTransactionInput {
        type: String!
        amount: Float!
        date: String!
        merchant: String
        category: String
        notes: String
        tags: [String]
    }

    input CreateBudgetInput {
        month: String!
        category: String!
        limit: Float!
        notes: String
    }

    type Mutation {
        register(input: RegisterInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload!
        createUser(input: CreateUserInput!): User!
        createTransaction(input: CreateTransactionInput!): Transaction!
        createBudget(input: CreateBudgetInput!): Budget!
        deleteTransaction(id: ID!): Boolean!
    }
`;

module.exports = typeDefs;