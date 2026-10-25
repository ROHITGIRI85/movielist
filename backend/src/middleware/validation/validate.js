const ApiError = require('../../utils/ApiError');

const validate = (validator) => (req, res, next) => {
  const { errors, value } = validator(req.body);
  if (errors.length > 0) {
    return next(new ApiError(422, 'VALIDATION_ERROR', 'The submitted data is invalid.', errors));
  }
  req.validatedBody = value;
  return next();
};

module.exports = validate;

