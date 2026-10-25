const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const { env } = require('../../config/env');
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  tokenExpiryDate,
  verifyRefreshToken,
} = require('./tokenService');

const MAX_REFRESH_SESSIONS = 5;

const safeUser = (user) => user.toJSON();

const removeExpiredSessions = (sessions) => {
  const now = Date.now();
  return sessions.filter((session) => session.expiresAt.getTime() > now);
};

const issueSession = async (user) => {
  const sessionId = crypto.randomUUID();
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user, sessionId);
  const existingSessions = removeExpiredSessions(user.refreshSessions || []);

  user.refreshSessions = [
    ...existingSessions.slice(-(MAX_REFRESH_SESSIONS - 1)),
    {
      sessionId,
      tokenHash: hashToken(refreshToken),
      expiresAt: tokenExpiryDate(refreshToken),
    },
  ];
  await user.save();

  return { accessToken, refreshToken, user: safeUser(user) };
};

const register = async ({ name, email, password, phone }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.exists({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'An account already uses this email address.');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, phone });
  user.refreshSessions = [];
  return issueSession(user);
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +refreshSessions');
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordMatches || !user.isActive) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  return issueSession(user);
};

const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'The refresh session is invalid or expired.');
  }

  const user = await User.findById(payload.sub).select('+refreshSessions');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'The refresh session is invalid or expired.');
  }

  const suppliedHash = hashToken(refreshToken);
  const storedSession = user.refreshSessions.find(
    (session) => session.sessionId === payload.jti && session.tokenHash === suppliedHash,
  );
  if (!storedSession || storedSession.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'The refresh session is invalid or expired.');
  }

  user.refreshSessions = user.refreshSessions.filter((session) => session.sessionId !== payload.jti);
  return issueSession(user);
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.sub).select('+refreshSessions');
    if (!user) return;
    const suppliedHash = hashToken(refreshToken);
    user.refreshSessions = user.refreshSessions.filter(
      (session) => session.sessionId !== payload.jti || session.tokenHash !== suppliedHash,
    );
    await user.save();
  } catch {
    // Logout is idempotent: an invalid or expired token is already unusable.
  }
};

module.exports = { register, login, refresh, logout };

