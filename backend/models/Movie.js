const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    genres: {
      type: [String],
      required: true,
      index: true,
    },
    languages: {
      type: [String],
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    formats: {
      type: [String],
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: ['2D', 'IMAX'],
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: 'Unknown Director',
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG', 'PG-13', 'R'],
      default: 'UA',
    },
    status: {
      type: String,
      enum: ['NOW_SHOWING', 'UPCOMING', 'ARCHIVED'],
      default: 'NOW_SHOWING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
movieSchema.index({
  title: 'text',
  description: 'text',
  genres: 'text',
  director: 'text',
  cast: 'text',
});

module.exports = mongoose.model('Movie', movieSchema);
