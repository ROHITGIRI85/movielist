const ApiError = require('../../utils/ApiError');

const requireOwnershipOrRole = ({ getOwnerId, allowedRoles = [] }) => (req, res, next) => {
  const requesterId = req.user?.id;
  const ownerId = getOwnerId(req);
  const roleAllowed = req.user && allowedRoles.includes(req.user.role);

  if (!requesterId || (!roleAllowed && requesterId !== ownerId?.toString())) {
    return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to access this resource.'));
  }

  return next();
};

module.exports = requireOwnershipOrRole;

