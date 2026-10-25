const express = require('express');
const authenticate = require('../../middleware/auth/authenticate');
const validate = require('../../middleware/validation/validate');
const controller = require('../../controllers/bookings/bookingController');
const { validateHoldCreate, validateConfirmation } = require('../../validators/bookings/bookingValidators');

const router = express.Router();
router.use(authenticate);
router.post('/holds', validate(validateHoldCreate), controller.createHold);
router.get('/', controller.listBookings);
router.get('/:bookingId', controller.getBooking);
router.post('/:bookingId/confirm', validate(validateConfirmation), controller.confirmBooking);
router.post('/:bookingId/cancel', controller.cancelBooking);

module.exports = router;
