const crypto = require('crypto');

const createBookingReference = () => `IMV-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
const createHoldToken = () => crypto.randomBytes(24).toString('hex');

module.exports = { createBookingReference, createHoldToken };
