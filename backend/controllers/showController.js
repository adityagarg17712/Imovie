const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');
const { APIError } = require('../middleware/errorHandler');

// Helper to auto-expire stale seat locks (> 5 minutes old)
const releaseStaleLocks = async (showId) => {
  const lockDuration = parseInt(process.env.SEAT_LOCK_DURATION_MINUTES, 10) || 5;
  const expirationThreshold = new Date(Date.now() - lockDuration * 60 * 1000);

  const staleSeats = await Seat.find({
    show: showId,
    status: 'LOCKED',
    lockedAt: { $lt: expirationThreshold },
  });

  if (staleSeats.length > 0) {
    await Seat.updateMany(
      {
        show: showId,
        status: 'LOCKED',
        lockedAt: { $lt: expirationThreshold },
      },
      {
        $set: {
          status: 'AVAILABLE',
          lockedBy: null,
          lockedAt: null,
        },
      }
    );
  }
  return staleSeats;
};

// @desc    Get shows filtered by movie, date, city, theatre
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movie, date, city, theatre } = req.query;

    let query = {
      status: { $in: ['SCHEDULED', 'ACTIVE'] },
    };

    if (movie) query.movie = movie;
    if (date) query.date = date;
    if (theatre) query.theatre = theatre;

    let theatreFilter = {};
    if (city && city !== 'All Cities') {
      theatreFilter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const matchingTheatres = await Theatre.find(theatreFilter);
    const theatreIds = matchingTheatres.map((t) => t._id);

    if (city && city !== 'All Cities') {
      query.theatre = { $in: theatreIds };
    }

    const shows = await Show.find(query)
      .populate('movie', 'title posterUrl durationMinutes rating certificate genres languages')
      .populate('theatre', 'name city location address amenities')
      .sort('theatre date startTime');

    // Group shows by Theatre for easy frontend consumption
    const theatreMap = {};
    shows.forEach((show) => {
      if (!show.theatre) return;
      const tid = show.theatre._id.toString();
      if (!theatreMap[tid]) {
        theatreMap[tid] = {
          theatre: show.theatre,
          shows: [],
        };
      }
      theatreMap[tid].shows.push({
        _id: show._id,
        screenNumber: show.screenNumber,
        screenType: show.screenType,
        date: show.date,
        startTime: show.startTime,
        endTime: show.endTime,
        pricing: show.pricing,
        availableSeats: show.availableSeats,
        totalSeats: show.totalSeats,
      });
    });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: Object.values(theatreMap),
      rawShows: shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details and its live seat matrix
// @route   GET /api/shows/:id
// @access  Public
const getShowDetailsAndSeats = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return next(new APIError('Show not found', 404));
    }

    // Auto-release stale locks before returning seat state
    await releaseStaleLocks(show._id);

    // Fetch all seats for this show ordered by row and col
    const seats = await Seat.find({ show: show._id }).sort('row col');

    // Calculate current available count
    const availableCount = seats.filter((s) => s.status === 'AVAILABLE').length;
    if (show.availableSeats !== availableCount) {
      show.availableSeats = availableCount;
      await show.save();
    }

    res.status(200).json({
      success: true,
      data: {
        show,
        seats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new show and generate seat matrix
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const {
      movie: movieId,
      theatre: theatreId,
      screenNumber = 1,
      screenType = 'STANDARD',
      date,
      startTime,
      endTime,
      pricing,
    } = req.body;

    if (!movieId || !theatreId || !date || !startTime || !endTime) {
      return next(
        new APIError('Please provide movie, theatre, date, startTime, and endTime', 400)
      );
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return next(new APIError('Referenced movie not found', 404));

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) return next(new APIError('Referenced theatre not found', 404));

    // Find screen configuration in theatre
    const screenConfig =
      theatre.screens.find((s) => s.screenNumber === parseInt(screenNumber, 10)) || {
        rows: 8,
        cols: 12,
        seatLayout: {
          silverRows: ['A', 'B', 'C'],
          goldRows: ['D', 'E', 'F'],
          vipRows: ['G', 'H'],
        },
      };

    const showPrices = pricing || {
      silver: 150,
      gold: 250,
      vip: 400,
    };

    const totalSeatsCount = (screenConfig.rows || 8) * (screenConfig.cols || 12);

    const show = await Show.create({
      movie: movieId,
      theatre: theatreId,
      screenNumber,
      screenType: screenType || screenConfig.screenType || 'STANDARD',
      date,
      startTime,
      endTime,
      pricing: showPrices,
      totalSeats: totalSeatsCount,
      availableSeats: totalSeatsCount,
      status: 'SCHEDULED',
    });

    // Auto-generate Seats based on layout
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].slice(
      0,
      screenConfig.rows || 8
    );
    const colsCount = screenConfig.cols || 12;

    const seatDocs = [];
    const layout = screenConfig.seatLayout || {
      silverRows: ['A', 'B', 'C'],
      goldRows: ['D', 'E', 'F'],
      vipRows: ['G', 'H'],
    };

    rowLetters.forEach((row) => {
      let tier = 'SILVER';
      let price = showPrices.silver;

      if (layout.vipRows && layout.vipRows.includes(row)) {
        tier = 'VIP';
        price = showPrices.vip;
      } else if (layout.goldRows && layout.goldRows.includes(row)) {
        tier = 'GOLD';
        price = showPrices.gold;
      }

      for (let c = 1; c <= colsCount; c++) {
        seatDocs.push({
          show: show._id,
          seatNumber: `${row}${c}`,
          row,
          col: c,
          tier,
          price,
          status: 'AVAILABLE',
          lockedBy: null,
          lockedAt: null,
        });
      }
    });

    await Seat.insertMany(seatDocs);

    res.status(201).json({
      success: true,
      message: `Show created successfully with ${seatDocs.length} generated seats`,
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a show
// @route   PUT /api/shows/:id/cancel
// @access  Private/Admin
const cancelShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return next(new APIError('Show not found', 404));
    }

    show.status = 'CANCELLED';
    await show.save();

    res.status(200).json({
      success: true,
      message: 'Show cancelled successfully',
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  releaseStaleLocks,
  getShows,
  getShowDetailsAndSeats,
  createShow,
  cancelShow,
};
