const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { verifyAccessToken } = require('../../services/auth/tokenService');

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'A valid access token is required.');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, 'INVALID_ACCESS_TOKEN', 'The access token is invalid or expired.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'INVALID_ACCESS_TOKEN', 'The access token is invalid or expired.');
  }

  req.user = user;
  return next();
});

module.exports = authenticate;

