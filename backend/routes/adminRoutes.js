const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllBookings } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/bookings', protect, adminOnly, getAllBookings);

module.exports = router;
