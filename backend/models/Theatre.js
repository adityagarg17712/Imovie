const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: 'Screen 1',
  },
  screenType: {
    type: String,
    enum: ['STANDARD', 'IMAX', 'DOLBY_ATMOS', '4DX'],
    default: 'STANDARD',
  },
  rows: {
    type: Number,
    default: 8,
  },
  cols: {
    type: Number,
    default: 12,
  },
  seatLayout: {
    silverRows: {
      type: [String],
      default: ['A', 'B', 'C'],
    },
    goldRows: {
      type: [String],
      default: ['D', 'E', 'F'],
    },
    vipRows: {
      type: [String],
      default: ['G', 'H'],
    },
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    totalScreens: {
      type: Number,
      default: 1,
    },
    screens: [screenSchema],
    amenities: {
      type: [String],
      default: ['Dolby 7.1', 'Parking', 'Cafeteria', 'Wheelchair Access'],
    },
  },
  {
    timestamps: true,
  }
);

theatreSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
