SWE_Training — MoneyTracker (MT)

Project Name
------------
MT (MoneyTracker) is a personal finance dashboard that lets you log expenses/income, categorize transactions, and instantly see where your money goes. With clean charts, smart budgets, and fast GraphQL queries, it turns raw spending into clear, actionable insights you can trust.

Target User
-----------
Who: Students and early-career professionals who want a simple, private, and insightful way to manage money without bank-account linking.

Need: Quick entry + clear analytics (categories, trends, budgets) to make better day-to-day decisions.

Purpose & Problem Statement
---------------------------
Problem: Most finance apps feel heavy, require bank linking, or bury insights. Manual spreadsheets lack automation and visual clarity.

Why it matters: Transparent, privacy-friendly tracking with instant analysis helps users stick to budgets, cut waste, and hit savings goals—without friction.

Core Features (3–5)
--------------------
- Transactions + Categorization

	Add income/expense with amount, date, merchant, category, notes, tags.

- Budgets & Alerts

	Monthly category budgets (e.g., Food $250). Real-time progress bars; soft alerts when nearing/over budget.

- Analytics Dashboard / Trends

	Monthly spend/income lines. Category pie/bar. Insights.

- Saved Views & Filters

	Date ranges, categories, tags, amount ranges, etc.

Technical Overview
------------------

React

UI pages: Authentication, Transactions, Dashboard, Budgets, Settings.

GraphQL

Queries for aggregates (totals by month/category) and paginated transactions. Budget updates. Subscriptions (optional) to live-refresh dashboards if you have multiple tabs open.

MongoDB

Collections: users, transactions, budgets, rules (optional). Time-range + category indexes for fast analytics.

Authentication

Use JWT-based authentication for API access; store refresh tokens securely (server-side or secure cookie) and avoid storing plaintext passwords.

Getting started (dev)
---------------------
1. Backend

```bash
cd backend
npm install
# start (recommended: use the helper to ensure previous server is stopped)
npm run dev:start
```

2. Frontend (placeholder)

Implement a React app in `/frontend` and connect to the GraphQL endpoint at `http://localhost:4000/graphql`.

Repository structure (important files)
- backend/
	- index.js — server entrypoint
	- config.js — reads `MONGODB_URI` from environment
	- graphql/TypeDefs.js — GraphQL schema
	- graphql/resolvers/ — resolvers wired to Mongoose models
	- models/ — Mongoose schemas (User, Transaction, Budget)

Contributing
------------
Create feature branches and open pull requests. The branch `feat/graphql-and-models` contains the recent backend work (models, GraphQL types/resolvers, startup helper).

License
-------
Add your license of choice.
