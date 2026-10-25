const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    seatNumber: {
      type: String, // e.g., 'A1', 'C7'
      required: true,
      trim: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    col: {
      type: Number,
      required: true,
    },
    tier: {
      type: String,
      enum: ['SILVER', 'GOLD', 'VIP'],
      default: 'SILVER',
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LOCKED', 'BOOKED'],
      default: 'AVAILABLE',
      index: true,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate seat numbers within the same show
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ show: 1, status: 1 });

module.exports = mongoose.model('Seat', seatSchema);
