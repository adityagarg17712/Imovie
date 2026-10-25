import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { bookingService } from '../services/bookingService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeShow,
    activeMovie,
    selectedSeats,
    subtotal,
    convenienceFee,
    taxes,
    totalAmount,
    setCompletedBooking,
    clearBookingSession,
  } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Alex Johnson');
  const [upiId, setUpiId] = useState('alex@upi');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!activeShow || selectedSeats.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4>No active booking session found</h4>
        <p className="text-muted small">Please select a movie and seats first.</p>
        <Link to="/" className="btn btn-danger rounded-pill px-4">
          Browse Movies
        </Link>
      </div>
    );
  }

  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMessage('');

    try {
      const payload = {
        showId: activeShow._id,
        seatNumbers: selectedSeats.map((s) => s.seatNumber),
        paymentMethod,
      };

      const res = await bookingService.createBooking(payload);

      if (res.success && res.data) {
        setCompletedBooking(res.data);
        clearBookingSession();
        navigate(`/confirmation/${res.data._id}`);
      }
    } catch (err) {
      console.error('Booking payment error:', err);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4 justify-content-center">
        {/* Left Column: Payment Details */}
        <div className="col-lg-7">
          <div className="card bg-card border border-secondary rounded-4 p-4 shadow-sm mb-4">
            <h4 className="fw-bold text-light mb-3">Select Payment Method</h4>

            {errorMessage && (
              <div className="alert alert-danger py-2 small mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errorMessage}
              </div>
            )}

            {/* Payment Method Tabs */}
            <div className="d-flex gap-2 mb-4">
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 border ${
                  paymentMethod === 'CARD'
                    ? 'btn-danger text-light'
                    : 'btn-dark text-muted border-secondary'
                }`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <i className="bi bi-credit-card me-2"></i> Card
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 border ${
                  paymentMethod === 'UPI'
                    ? 'btn-danger text-light'
                    : 'btn-dark text-muted border-secondary'
                }`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <i className="bi bi-qr-code me-2"></i> UPI / QR
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 border ${
                  paymentMethod === 'NETBANKING'
                    ? 'btn-danger text-light'
                    : 'btn-dark text-muted border-secondary'
                }`}
                onClick={() => setPaymentMethod('NETBANKING')}
              >
                <i className="bi bi-bank me-2"></i> Net Banking
              </button>
            </div>

            <form onSubmit={handlePayNow}>
              {paymentMethod === 'CARD' && (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label small text-muted">Cardholder Full Name</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary shadow-none"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label small text-muted">Card Number</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary shadow-none"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                      <span className="input-group-text bg-dark border-secondary text-light">
                        <i className="bi bi-credit-card-2-front-fill text-danger"></i>
                      </span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-muted">Expiration Date</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary shadow-none"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="form-control bg-dark text-light border-secondary shadow-none"
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div>
                  <label className="form-label small text-muted">Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    placeholder="username@bank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                  <small className="text-secondary d-block mt-2">
                    A payment request will be simulated and auto-approved for this test transaction.
                  </small>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div>
                  <label className="form-label small text-muted">Select Primary Bank</label>
                  <select className="form-select bg-dark text-light border-secondary shadow-none">
                    <option>Chase Bank</option>
                    <option>Bank of America</option>
                    <option>Wells Fargo</option>
                    <option>Citibank</option>
                    <option>HSBC</option>
                  </select>
                </div>
              )}

              <div className="mt-4 pt-3 border-top border-secondary">
                <button
                  type="submit"
                  className="btn btn-danger w-100 rounded-pill py-3 fw-bold shadow-lg"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Authorizing Payment...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill me-2"></i> Pay ${totalAmount.toFixed(2)} Securely
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="col-lg-5">
          <div className="card bg-card border border-secondary rounded-4 p-4 shadow-sm sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold text-light mb-3 pb-2 border-bottom border-secondary">
              Order Review
            </h5>

            <div className="d-flex gap-3 mb-3">
              <img
                src={activeMovie?.posterUrl}
                alt={activeMovie?.title}
                className="rounded-3 border border-secondary"
                style={{ width: '70px', height: '100px', objectFit: 'cover' }}
              />
              <div>
                <h6 className="fw-bold text-light mb-1">{activeMovie?.title}</h6>
                <div className="badge bg-secondary mb-1">{activeShow?.screenType || 'IMAX'}</div>
                <div className="small text-muted">{activeShow?.theatre?.name}</div>
                <div className="small text-danger fw-semibold">
                  {activeShow?.date} • {activeShow?.startTime}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-muted small">Seats:</div>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {selectedSeats.map((s) => (
                  <span key={s.seatNumber} className="badge bg-success">
                    {s.seatNumber} ({s.tier})
                  </span>
                ))}
              </div>
            </div>

            <div className="small text-muted border-top border-secondary pt-3 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span>Tickets Subtotal</span>
                <span className="text-light">${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Convenience Fee</span>
                <span className="text-light">${convenienceFee.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Taxes (8%)</span>
                <span className="text-light">${taxes.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fs-5 fw-bold text-light border-top border-secondary pt-2 mt-1">
                <span>Total Amount</span>
                <span className="text-danger">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
