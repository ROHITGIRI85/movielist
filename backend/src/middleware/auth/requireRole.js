const ApiError = require('../../utils/ApiError');

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
  }
  return next();
};

module.exports = requireRole;

