const { MongoClient } = require('mongodb');
require('dotenv').config();

const CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;

async function testConnection() {
  let client;
  
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', CONNECTION_STRING.replace(/:[^:@]*@/, ':****@'));
    
    client = new MongoClient(CONNECTION_STRING, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ MongoDB client connected successfully');
    
    const db = client.db(DATABASE_NAME);
    console.log(`✅ Connected to database: ${DATABASE_NAME}`);
    
    // Test ping
    await db.admin().ping();
    console.log('✅ MongoDB ping successful');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Test user collection
    const userCollection = db.collection('user');
    const userCount = await userCollection.countDocuments();
    console.log(`👥 Users in collection: ${userCount}`);
    
    // Test roles collection
    const rolesCollection = db.collection('roles');
    const rolesCount = await rolesCollection.countDocuments();
    console.log(`🛡️ Roles in collection: ${rolesCount}`);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });
  } finally {
    if (client) {
      await client.close();
      console.log('Connection closed');
    }
  }
}

testConnection();