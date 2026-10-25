const express = require('express');
const { getHealth } = require('../controllers/healthController');
const authRoutes = require('./public/authRoutes');
const profileRoutes = require('./protected/profileRoutes');
const adminRoutes = require('./admin/adminRoutes');
const publicCatalogueRoutes = require('./public/catalogueRoutes');
const adminCatalogueRoutes = require('./admin/catalogueRoutes');
const bookingRoutes = require('./protected/bookingRoutes');

const router = express.Router();

router.get('/health', getHealth);
router.use('/auth', authRoutes);
router.use('/auth/me', profileRoutes);
router.use('/bookings', bookingRoutes);
router.use('/', publicCatalogueRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', adminCatalogueRoutes);

module.exports = router;

