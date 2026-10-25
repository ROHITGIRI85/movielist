const { env } = require('../src/config/env');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const Movie = require('../src/models/Movie');
const Cinema = require('../src/models/Cinema');
const Screen = require('../src/models/Screen');
const Show = require('../src/models/Show');
const ShowSeat = require('../src/models/ShowSeat');
const { createShowInventory } = require('../src/services/inventory/inventoryService');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const demoAccountsFromEnv = require('./data/accounts');
const logger = require('../src/config/logger');
const data = require('./data/catalogue');

const seed = async () => {
  if (env.nodeEnv === 'production') throw new Error('Development seeds cannot run in production.');
  if (process.env.SEED_CONFIRM !== 'imovies-development') {
    throw new Error('Set SEED_CONFIRM=imovies-development to confirm development seeding.');
  }
  if (!env.mongoUri) throw new Error('MONGODB_URI is required.');

  await connectDatabase(env.mongoUri);
  for (const account of demoAccountsFromEnv()) {
    const passwordHash = await bcrypt.hash(account.password, env.bcryptRounds);
    await User.findOneAndUpdate(
      { email: account.email.toLowerCase() },
      { $set: { name: account.name, email: account.email.toLowerCase(), passwordHash, role: account.role, isActive: true }, $setOnInsert: { refreshSessions: [] } },
      { upsert: true, runValidators: true },
    );
  }
  for (const movie of data.movies) {
    await Movie.replaceOne({ _id: movie._id }, movie, { upsert: true, runValidators: true });
  }
  await Cinema.replaceOne({ _id: data.ids.cinema }, data.cinema, { upsert: true, runValidators: true });
  await Screen.replaceOne({ _id: data.ids.screen }, data.screen, { upsert: true, runValidators: true });
  for (const show of data.shows) {
    await Show.replaceOne({ _id: show._id }, show, { upsert: true, runValidators: true });
  }
  await ShowSeat.deleteMany({ show: { $in: data.ids.shows } });
  for (const showId of data.ids.shows) {
    await createShowInventory(await Show.findById(showId));
  }
  logger.info('Development accounts, catalogue, and seat-inventory seed completed.');
};

seed()
  .catch((error) => {
    logger.error('Development catalogue seed failed.', { error: error.message });
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);

