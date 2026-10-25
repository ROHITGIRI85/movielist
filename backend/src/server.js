const http = require('http');
const { setInterval, clearInterval } = require('node:timers');
const app = require('./app');
const { env, validateEnv } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const logger = require('./config/logger');
const releaseExpiredBookingHolds = require('./jobs/releaseExpiredHolds');

let httpServer;
let holdCleanupTimer;
let cleanupRunning = false;
let shuttingDown = false;

const startServer = async () => {
  validateEnv();
  await connectDatabase(env.mongoUri);

  holdCleanupTimer = setInterval(async () => {
    if (cleanupRunning) return;
    cleanupRunning = true;
    try {
      await releaseExpiredBookingHolds();
    } catch (error) {
      logger.error('Expired hold cleanup failed.', { error: error.message });
    } finally {
      cleanupRunning = false;
    }
  }, env.holdCleanupIntervalMs);
  holdCleanupTimer.unref();

  httpServer = http.createServer(app);
  httpServer.listen(env.port, () => {
    logger.info(`IMovies API listening on port ${env.port}`);
  });
};

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Received ${signal}; shutting down.`);

  if (holdCleanupTimer) clearInterval(holdCleanupTimer);
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch((error) => {
  logger.error('Unable to start IMovies API', { error: error.message });
  process.exit(1);
});

