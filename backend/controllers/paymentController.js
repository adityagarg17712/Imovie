const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { APIError } = require('../middleware/errorHandler');

// @desc    Process or simulate payment
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, amount, cardNumber } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new APIError('Booking not found', 404));
    }

    if (booking.paymentStatus === 'PAID') {
      return next(new APIError('This booking is already paid', 400));
    }

    const cardLastFour = cardNumber ? cardNumber.slice(-4) : '4242';
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      amount: amount || booking.totalAmount,
      currency: booking.currency || 'USD',
      transactionId,
      paymentMethod: paymentMethod || 'CARD',
      cardLastFour,
      status: 'SUCCESS',
      gatewayResponse: {
        network: 'Visa',
        authCode: 'APPRV' + Math.floor(100000 + Math.random() * 900000),
        status: 'succeeded',
      },
    });

    booking.payment = payment._id;
    booking.paymentStatus = 'PAID';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('user', 'name email');

    if (!payment) {
      return next(new APIError('Payment record not found', 404));
    }

    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new APIError('Not authorized to access this payment record', 403));
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentById,
};
