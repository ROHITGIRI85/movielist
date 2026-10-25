const mongoose = require('mongoose');

const validateHoldCreate = (body = {}) => {
  const errors = [];
  const value = {};
  if (!mongoose.isValidObjectId(body.showId)) errors.push({ field: 'showId', message: 'A valid show identifier is required.' });
  else value.showId = body.showId;
  if (!Array.isArray(body.seatIds) || body.seatIds.length < 1 || body.seatIds.length > 10) {
    errors.push({ field: 'seatIds', message: 'Choose between 1 and 10 seats.' });
  } else {
    const seatIds = body.seatIds.map(String);
    if (seatIds.some((id) => !mongoose.isValidObjectId(id))) errors.push({ field: 'seatIds', message: 'Every seat identifier must be valid.' });
    else if (new Set(seatIds).size !== seatIds.length) errors.push({ field: 'seatIds', message: 'Seat identifiers must be unique.' });
    else value.seatIds = seatIds;
  }
  return { errors, value };
};

const validateConfirmation = (body = {}) => {
  const errors = [];
  const value = {};
  if (!['success', 'failure'].includes(body.paymentResult)) {
    errors.push({ field: 'paymentResult', message: 'paymentResult must be success or failure.' });
  } else value.paymentResult = body.paymentResult;
  if (body.transactionReference !== undefined) {
    if (typeof body.transactionReference !== 'string' || !body.transactionReference.trim() || body.transactionReference.length > 100) {
      errors.push({ field: 'transactionReference', message: 'Transaction reference must be a non-empty string up to 100 characters.' });
    } else value.transactionReference = body.transactionReference.trim();
  }
  return { errors, value };
};

module.exports = { validateHoldCreate, validateConfirmation };
