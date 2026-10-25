const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const totalShows = await Show.countDocuments({ status: { $ne: 'CANCELLED' } });
    const totalBookings = await Booking.countDocuments();

    // Calculate total revenue from successful payments
    const revenueAggregation = await Payment.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title posterUrl')
      .populate('theatre', 'name city')
      .sort('-createdAt')
      .limit(10);

    // Group revenue by last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'SUCCESS',
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 5 popular movies by booking count
    const topMovies = await Booking.aggregate([
      { $match: { bookingStatus: 'CONFIRMED' } },
      { $group: { _id: '$movie', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieDetails',
        },
      },
      { $unwind: '$movieDetails' },
      {
        $project: {
          title: '$movieDetails.title',
          posterUrl: '$movieDetails.posterUrl',
          bookingsCount: '$count',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalMovies,
          totalTheatres,
          totalShows,
          totalBookings,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
        },
        recentBookings,
        dailyRevenue,
        topMovies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with pagination and filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    let query = {};
    if (status && status !== 'ALL') {
      query.bookingStatus = status;
    }

    if (search) {
      query.bookingReference = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title')
      .populate('theatre', 'name city')
      .populate('payment')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
};
