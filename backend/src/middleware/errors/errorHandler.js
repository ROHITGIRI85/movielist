const ApiError = require('../../utils/ApiError');
const { env } = require('../../config/env');
const logger = require('../../config/logger');

const normalizeError = (error) => {
  if (error instanceof ApiError) return error;

  if (error?.name === 'ValidationError') {
    const details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    return new ApiError(422, 'VALIDATION_ERROR', 'The submitted data is invalid.', details);
  }

  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern || error.keyValue || {});
    return new ApiError(
      409,
      'RESOURCE_CONFLICT',
      'A record with the same unique value already exists.',
      fields.map((field) => ({ field, message: `${field} must be unique.` })),
    );
  }

  if (error?.name === 'CastError') {
    return new ApiError(400, 'INVALID_IDENTIFIER', 'A supplied identifier is invalid.');
  }

  return new ApiError(500, 'INTERNAL_SERVER_ERROR', 'An unexpected server error occurred.');
};

const errorHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error);

  if (normalized.statusCode >= 500) {
    logger.error('Unhandled request error', {
      method: req.method,
      path: req.originalUrl,
      error: error.message,
      stack: env.nodeEnv === 'development' ? error.stack : undefined,
    });
  }

  res.status(normalized.statusCode).json({
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      ...(env.nodeEnv === 'development' && normalized.statusCode >= 500
        ? { stack: error.stack }
        : {}),
    },
  });
};

module.exports = errorHandler;

