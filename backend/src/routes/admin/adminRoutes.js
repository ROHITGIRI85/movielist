const express = require('express');
const { getAdminStatus } = require('../../controllers/admin/adminController');
const bookingController = require('../../controllers/bookings/bookingController');
const authenticate = require('../../middleware/auth/authenticate');
const requireRole = require('../../middleware/auth/requireRole');
const { ROLES } = require('../../constants/roles');

const router = express.Router();

router.use(authenticate, requireRole(ROLES.ADMIN));
router.get('/status', getAdminStatus);
router.get('/bookings', bookingController.listAdminBookings);

module.exports = router;

