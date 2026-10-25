const express = require('express');
const router = express.Router();
const {
  getShows,
  getShowDetailsAndSeats,
  createShow,
  cancelShow,
} = require('../controllers/showController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

router.get('/', getShows);
router.get('/:id', getShowDetailsAndSeats);

// Admin-only routes
router.post('/', protect, adminOnly, createShow);
router.put('/:id/cancel', protect, adminOnly, cancelShow);

module.exports = router;
