const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDatabase, disconnectDatabase } = require('../../src/config/database');

let mongoServer;

const startTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDatabase(mongoServer.getUri());
};

const stopTestDatabase = async () => {
  await disconnectDatabase();
  if (mongoServer) await mongoServer.stop();
};

module.exports = { startTestDatabase, stopTestDatabase };

