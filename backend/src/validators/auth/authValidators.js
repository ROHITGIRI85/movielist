const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

const fieldError = (field, message) => ({ field, message });
const hasOwn = (object, field) => Object.prototype.hasOwnProperty.call(object, field);

const validateRegister = (body = {}) => {
  const errors = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

  if (name.length < 2 || name.length > 80) {
    errors.push(fieldError('name', 'Name must contain between 2 and 80 characters.'));
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    errors.push(fieldError('email', 'Enter a valid email address.'));
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.push(fieldError('phone', 'Phone must use international E.164 format, for example +919876543210.'));
  }
  if (password.length < 8 || password.length > 128) {
    errors.push(fieldError('password', 'Password must contain between 8 and 128 characters.'));
  } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    errors.push(fieldError('password', 'Password must include uppercase, lowercase, and numeric characters.'));
  }

  return { errors, value: { name, email, password, ...(phone ? { phone } : {}) } };
};

const validateLogin = (body = {}) => {
  const errors = [];
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!EMAIL_PATTERN.test(email)) errors.push(fieldError('email', 'Enter a valid email address.'));
  if (!password) errors.push(fieldError('password', 'Password is required.'));

  return { errors, value: { email, password } };
};

const validateProfileUpdate = (body = {}) => {
  const errors = [];
  const value = {};
  const allowedFields = ['name', 'phone'];
  const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));

  if (unknownFields.length > 0) {
    errors.push(...unknownFields.map((field) => fieldError(field, 'This field cannot be updated.')));
  }

  if (hasOwn(body, 'name')) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 80) {
      errors.push(fieldError('name', 'Name must contain between 2 and 80 characters.'));
    } else {
      value.name = name;
    }
  }

  if (hasOwn(body, 'phone')) {
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (body.phone === null || phone === '') {
      value.phone = null;
    } else if (!PHONE_PATTERN.test(phone)) {
      errors.push(fieldError('phone', 'Phone must use international E.164 format, for example +919876543210.'));
    } else {
      value.phone = phone;
    }
  }

  if (!hasOwn(value, 'name') && !hasOwn(value, 'phone') && unknownFields.length === 0) {
    errors.push(fieldError('body', 'Provide at least one profile field to update.'));
  }

  return { errors, value };
};

module.exports = { validateRegister, validateLogin, validateProfileUpdate };
