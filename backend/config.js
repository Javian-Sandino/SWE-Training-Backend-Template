// backend/config.js
// Export MONGODB_URI from environment variables so the app can connect to MongoDB.
// Set MONGODB_URI in your shell or .env file before starting the server.

const MONGODB_URI = process.env.MONGODB_URI || '';

module.exports = { MONGODB_URI };

/*
Quick setup instructions:

Option A - MongoDB Atlas (recommended for cloud / easy setup):
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow your IP (or 0.0.0.0/0 for testing)
3. Copy the connection string (URI) and set it in your shell before running the server:

	export MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/mydb?retryWrites=true&w=majority"

Option B - Local MongoDB via Homebrew (macOS):
1. Install mongosh and mongodb-community via Homebrew:

	brew tap mongodb/brew
	brew install mongodb-community@6.0

2. Start MongoDB as a background service:

	brew services start mongodb/brew/mongodb-community

3. Default local URI:

	export MONGODB_URI="mongodb://localhost:27017/mydb"

Then start your server (from the backend folder):
	npm start

*/