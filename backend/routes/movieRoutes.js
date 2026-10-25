const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  getFilterOptions,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

router.get('/', getMovies);
router.get('/filters/options', getFilterOptions);
router.get('/:id', getMovieById);

// Admin-only routes
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
