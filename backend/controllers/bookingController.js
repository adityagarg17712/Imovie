const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const QRCode = require('qrcode');
const { APIError } = require('../middleware/errorHandler');

// Helper to generate unique booking reference
const generateBookingRef = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `IMOV-${dateStr}-${randomStr}`;
};

// @desc    Create a new booking and reserve seats
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showId, seatNumbers, paymentMethod = 'CARD' } = req.body;
    const userId = req.user.id;

    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return next(new APIError('Please provide showId and an array of seat numbers', 400));
    }

    const show = await Show.findById(showId)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return next(new APIError('Show not found', 404));
    }

    if (show.status !== 'SCHEDULED' && show.status !== 'ACTIVE') {
      return next(new APIError(`Show is not open for booking (status: ${show.status})`, 400));
    }

    // Find requested seats
    const seats = await Seat.find({
      show: showId,
      seatNumber: { $in: seatNumbers },
    });

    if (seats.length !== seatNumbers.length) {
      return next(new APIError('One or more selected seats were not found in this show', 404));
    }

    // Verify seat availability (must either be AVAILABLE, or LOCKED by this same user)
    const unavailableSeats = seats.filter((s) => {
      if (s.status === 'BOOKED') return true;
      if (s.status === 'LOCKED' && s.lockedBy && s.lockedBy.toString() !== userId.toString()) {
        return true;
      }
      return false;
    });

    if (unavailableSeats.length > 0) {
      const names = unavailableSeats.map((s) => s.seatNumber).join(', ');
      return next(
        new APIError(`Seat(s) ${names} are no longer available. Please select different seats.`, 409)
      );
    }

    // Compute prices
    let subtotal = 0;
    const seatDetails = seats.map((seat) => {
      subtotal += seat.price;
      return {
        seatNumber: seat.seatNumber,
        tier: seat.tier,
        price: seat.price,
      };
    });

    const convenienceFee = Math.round(seatNumbers.length * 1.5 * 100) / 100;
    const taxes = Math.round(subtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((subtotal + convenienceFee + taxes) * 100) / 100;

    const bookingReference = generateBookingRef();

    // Generate QR code for paperless cinema entry
    const qrPayload = JSON.stringify({
      ref: bookingReference,
      movie: show.movie.title,
      theatre: show.theatre.name,
      screen: show.screenNumber,
      date: show.date,
      time: show.startTime,
      seats: seatNumbers,
      total: totalAmount,
    });
    const qrCodeData = await QRCode.toDataURL(qrPayload);

    // Create the booking
    const booking = await Booking.create({
      bookingReference,
      user: userId,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      screenNumber: show.screenNumber,
      showDate: show.date,
      showTime: show.startTime,
      seats: seatNumbers,
      seatDetails,
      subtotal,
      convenienceFee,
      taxes,
      totalAmount,
      currency: 'USD',
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      qrCodeData,
    });

    // Mark seats as BOOKED
    await Seat.updateMany(
      {
        show: showId,
        seatNumber: { $in: seatNumbers },
      },
      {
        $set: {
          status: 'BOOKED',
          lockedBy: null,
          lockedAt: null,
          booking: booking._id,
        },
      }
    );

    // Create Payment transaction record
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      amount: totalAmount,
      currency: 'USD',
      transactionId,
      paymentMethod,
      cardLastFour: '4242',
      status: 'SUCCESS',
      gatewayResponse: {
        authorizationCode: 'AUTH-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        gateway: 'MockStripeSimulator',
        timestamp: new Date(),
      },
    });

    booking.payment = payment._id;
    await booking.save();

    // Decrement availableSeats on Show
    const currentRemaining = await Seat.countDocuments({ show: showId, status: 'AVAILABLE' });
    show.availableSeats = currentRemaining;
    await show.save();

    // Create notification
    await Notification.create({
      user: userId,
      title: 'Booking Confirmed!',
      message: `Your tickets for ${show.movie.title} on ${show.date} at ${show.startTime} (Seats: ${seatNumbers.join(
        ', '
      )}) are confirmed!`,
      type: 'BOOKING_CONFIRMED',
      metadata: { bookingId: booking._id, reference: bookingReference },
    });

    // Populate for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title posterUrl durationMinutes rating certificate')
      .populate('theatre', 'name city location address')
      .populate('payment');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of current user (upcoming and past)
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = { user: userId };
    if (status) {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('movie', 'title posterUrl durationMinutes rating certificate genres')
      .populate('theatre', 'name city location address')
      .populate('payment')
      .sort('-createdAt');

    const nowIso = new Date().toISOString().slice(0, 10);
    const upcoming = bookings.filter((b) => b.showDate >= nowIso && b.bookingStatus === 'CONFIRMED');
    const past = bookings.filter((b) => b.showDate < nowIso || b.bookingStatus !== 'CONFIRMED');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: {
        all: bookings,
        upcoming,
        past,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('payment')
      .populate('user', 'name email phone');

    if (!booking) {
      return next(new APIError('Booking not found', 404));
    }

    // Check ownership unless admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new APIError('Not authorized to access this booking', 403));
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking and refund
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'User requested cancellation' } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new APIError('Booking not found', 404));
    }

    // Verify ownership
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new APIError('Not authorized to cancel this booking', 403));
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return next(new APIError('Booking is already cancelled', 400));
    }

    // Check cancellation deadline: at least 2 hours before show
    const showDateTime = new Date(`${booking.showDate}T${booking.showTime}:00`);
    const currentDateTime = new Date();
    const diffHours = (showDateTime - currentDateTime) / (1000 * 60 * 60);

    if (diffHours < 2 && req.user.role !== 'admin') {
      return next(
        new APIError('Bookings can only be cancelled at least 2 hours before showtime', 400)
      );
    }

    // Update booking status
    booking.bookingStatus = 'CANCELLED';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.refundAmount = booking.totalAmount;
    booking.paymentStatus = 'REFUNDED';
    await booking.save();

    // Release seats
    await Seat.updateMany(
      {
        show: booking.show,
        seatNumber: { $in: booking.seats },
      },
      {
        $set: {
          status: 'AVAILABLE',
          lockedBy: null,
          lockedAt: null,
          booking: null,
        },
      }
    );

    // Update payment record
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, {
        status: 'REFUNDED',
        refundTransactionId: `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }

    // Recalculate show availableSeats
    const remaining = await Seat.countDocuments({ show: booking.show, status: 'AVAILABLE' });
    await Show.findByIdAndUpdate(booking.show, { availableSeats: remaining });

    // Notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking (${booking.bookingReference}) has been cancelled. Full refund of $${booking.totalAmount} has been processed.`,
      type: 'BOOKING_CANCELLED',
      metadata: { bookingId: booking._id },
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and seats released successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
};
