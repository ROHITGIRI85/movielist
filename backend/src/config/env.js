const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const asPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: asPositiveInteger(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || '',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || '',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: asPositiveInteger(process.env.BCRYPT_ROUNDS, 12),
  holdCleanupIntervalMs: asPositiveInteger(process.env.HOLD_CLEANUP_INTERVAL_MS, 60000),
});

const validateEnv = () => {
  const missing = [];

  if (!env.mongoUri) missing.push('MONGODB_URI');
  if (env.accessTokenSecret.length < 32) missing.push('JWT_ACCESS_SECRET (minimum 32 characters)');
  if (env.refreshTokenSecret.length < 32) missing.push('JWT_REFRESH_SECRET (minimum 32 characters)');
  if (env.accessTokenSecret && env.accessTokenSecret === env.refreshTokenSecret) {
    missing.push('JWT access and refresh secrets must be different');
  }

  if (missing.length > 0) {
    throw new Error(`Invalid environment configuration: ${missing.join(', ')}`);
  }

  return env;
};

module.exports = { env, validateEnv };

