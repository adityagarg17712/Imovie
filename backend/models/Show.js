const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true,
    },
    screenNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    screenType: {
      type: String,
      default: 'STANDARD',
    },
    date: {
      type: String, // Stored as ISO YYYY-MM-DD for fast date matching
      required: [true, 'Show date is required (YYYY-MM-DD)'],
      index: true,
    },
    startTime: {
      type: String, // e.g. "18:30"
      required: [true, 'Show start time is required'],
    },
    endTime: {
      type: String, // e.g. "21:15"
      required: true,
    },
    pricing: {
      silver: {
        type: Number,
        default: 150,
      },
      gold: {
        type: Number,
        default: 250,
      },
      vip: {
        type: Number,
        default: 450,
      },
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ACTIVE', 'CANCELLED', 'COMPLETED'],
      default: 'SCHEDULED',
    },
    totalSeats: {
      type: Number,
      default: 96,
    },
    availableSeats: {
      type: Number,
      default: 96,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding shows by movie and date
showSchema.index({ movie: 1, date: 1 });
showSchema.index({ theatre: 1, date: 1 });

module.exports = mongoose.model('Show', showSchema);
