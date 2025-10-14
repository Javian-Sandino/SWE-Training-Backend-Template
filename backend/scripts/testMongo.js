// Simple MongoDB connection test script.
// Usage:
//   export MONGODB_URI="your-connection-uri-here"
//   node backend/scripts/testMongo.js

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI is not set. Set it and re-run the script.');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
