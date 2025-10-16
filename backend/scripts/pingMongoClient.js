// backend/scripts/pingMongoClient.js
// Small script that pings MongoDB using the stable MongoDB Node driver API.
// Reads MONGODB_URI from environment variables or .env (do NOT commit secrets).

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI || '';

if(!uri){
  console.error('MONGODB_URI is not set. Please set it in the environment or in backend/.env');
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
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(err => {
  console.error('Failed to ping MongoDB:', err);
  process.exit(1);
});
