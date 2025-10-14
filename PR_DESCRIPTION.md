Title: feat(graphql/models): Add models and GraphQL API for Transactions & Budgets

Summary
-------
This PR adds the initial backend implementation for MoneyTracker (MT). It includes:

- Mongoose models: `Transaction`, `Budget`, `User` (in `backend/models/`).
- GraphQL schema and resolvers (in `backend/graphql/`) for creating and querying budgets & transactions.
- Dev tooling: `backend/scripts/testMongo.js` for verifying MongoDB connectivity, and `backend/scripts/start.sh` + `npm run dev:start` to safely restart the server during development.
- Documentation: updated `README.md` with project overview and `backend/README.md` with .env and model notes.

Files changed (high level)
- backend/models/*
- backend/graphql/TypeDefs.js
- backend/graphql/resolvers/index.js
- backend/scripts/testMongo.js
- backend/scripts/start.sh
- backend/README.md

Why
---
This change lays the foundation for MoneyTracker's backend: persistent storage (MongoDB), a well-typed GraphQL API for frontend consumption, and safe developer scripts to simplify running the server locally.

How to test locally
-------------------
1. Ensure you have Node & npm installed
2. Create a `.env` in `backend/` with `MONGODB_URI` or export it in your shell
3. Install and start:

```bash
cd backend
npm install
npm run dev:start
```

4. Use GraphQL playground at http://localhost:4000/graphql to run queries and mutations. Example mutation (`createBudget`) and query (`budgets(month:"YYYY-MM")`) are supported.

Next steps / TODO
-----------------
- Add authentication (JWT) and password hashing for user management.
- Add update/delete mutations for budgets and transactions.
- Add aggregation queries for dashboard analytics (totals by month/category).
- Add tests for resolvers and models.

Notes
-----
- Avoid committing `.env` (the repo's `backend/.gitignore` now ignores it).
- Consider migrating from `apollo-server-express` v3 to `@apollo/server` v4 for longer-term support.
