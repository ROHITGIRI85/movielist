const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../../src/config/database');

let mongoServer;

const startTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDatabase(mongoServer.getUri());
  await Promise.all(mongoose.modelNames().map((modelName) => mongoose.model(modelName).init()));
};

const stopTestDatabase = async () => {
  await disconnectDatabase();
  if (mongoServer) await mongoServer.stop();
};

module.exports = { startTestDatabase, stopTestDatabase };

