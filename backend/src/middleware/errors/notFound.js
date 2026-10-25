const ApiError = require('../../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(404, 'ROUTE_NOT_FOUND', 'The requested API route does not exist.'));
};

module.exports = notFound;

