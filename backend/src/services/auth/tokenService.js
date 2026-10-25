const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createAccessToken = (user) =>
  jwt.sign(
    { sub: user.id || user._id.toString(), role: user.role, type: 'access' },
    env.accessTokenSecret,
    { expiresIn: env.accessTokenExpiresIn },
  );

const createRefreshToken = (user, sessionId) =>
  jwt.sign(
    { sub: user.id || user._id.toString(), jti: sessionId, type: 'refresh' },
    env.refreshTokenSecret,
    { expiresIn: env.refreshTokenExpiresIn },
  );

const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, env.accessTokenSecret);
  if (payload.type !== 'access') throw new jwt.JsonWebTokenError('Invalid token type');
  return payload;
};

const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, env.refreshTokenSecret);
  if (payload.type !== 'refresh') throw new jwt.JsonWebTokenError('Invalid token type');
  return payload;
};

const tokenExpiryDate = (token) => {
  const payload = jwt.decode(token);
  return new Date(payload.exp * 1000);
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  hashToken,
  tokenExpiryDate,
  verifyAccessToken,
  verifyRefreshToken,
};

