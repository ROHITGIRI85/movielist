const asyncHandler = require('../../utils/asyncHandler');
const authService = require('../../services/auth/authService');
const { env } = require('../../config/env');

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth',
};

const refreshTokenFrom = (req) => req.cookies?.refreshToken || req.body?.refreshToken;

const sendSession = (res, statusCode, session) => {
  res.cookie('refreshToken', session.refreshToken, cookieOptions);
  return res.status(statusCode).json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken,
    },
  });
};

const register = asyncHandler(async (req, res) => {
  const session = await authService.register(req.validatedBody);
  return sendSession(res, 201, session);
});

const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.validatedBody);
  return sendSession(res, 200, session);
});

const refresh = asyncHandler(async (req, res) => {
  const session = await authService.refresh(refreshTokenFrom(req));
  return sendSession(res, 200, session);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(refreshTokenFrom(req));
  res.clearCookie('refreshToken', cookieOptions);
  return res.status(204).send();
});

module.exports = { register, login, refresh, logout };

