
// index.js is the entry point of your backend application.
// It starts a minimal Apollo Server + Express instance so you can run the
// backend locally for verification even if MongoDB config is not present.

// Load environment variables from .env (if present). Do this before any other
// module that reads process.env.
try {
	require('dotenv').config();
} catch (e) {
	// If dotenv isn't installed yet, we'll continue and the env vars can still be
	// provided by the shell. This try/catch avoids hard failing during setup.
}

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');

const typeDefs = require('./graphql/TypeDefs');
const resolvers = require('./graphql/resolvers');

const PORT = process.env.PORT || 4000;

async function startServer() {
	const app = express();

	const apolloServer = new ApolloServer({ typeDefs, resolvers });
	await apolloServer.start();
	apolloServer.applyMiddleware({ app, path: '/graphql' });

	// Attempt to connect to MongoDB if config provides a URI, but don't fail if not set.
	try {
		// eslint-disable-next-line global-require
		const { MONGODB_URI } = require('./config');

		// Helpful startup logging: show whether a MongoDB URI is configured (mask it for safety).
		function maskUri(uri) {
			if (!uri) return '';
			// show protocol and host tail only, mask credentials
			return uri.replace(/:(\/\/)([^@]+)@/, ':$1*****@');
		}

		console.log('MONGODB_URI configured:', Boolean(MONGODB_URI), maskUri(MONGODB_URI));

		if (MONGODB_URI) {
			mongoose.set('strictQuery', false);
			await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
			console.log('Connected to MongoDB');
		}
	} catch (err) {
		console.log('MongoDB not configured or connection failed (continuing without DB):', err.message || err);
	}

	app.get('/', (req, res) => res.send('Backend is running. GraphQL at /graphql'));

	app.listen(PORT, () => {
		console.log(`Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
	});
}

startServer().catch(err => {
	console.error('Failed to start server:', err);
	process.exit(1);
});


