import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useBooking } from '../context/BookingContext';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const { completedBooking } = useBooking();
  const [booking, setBooking] = useState(completedBooking);
  const [loading, setLoading] = useState(!completedBooking);

  useEffect(() => {
    if (!completedBooking && id) {
      const fetchBooking = async () => {
        try {
          const res = await bookingService.getBookingById(id);
          if (res.data) setBooking(res.data);
        } catch (err) {
          console.error('Fetch booking confirmation error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, completedBooking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Booking details unavailable</h4>
        <Link to="/" className="btn btn-outline-danger mt-3">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          {/* Top Success Banner */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-success text-light rounded-circle mb-3"
              style={{ width: '64px', height: '64px' }}
            >
              <i className="bi bi-check-lg fs-1"></i>
            </div>
            <h3 className="fw-bold text-light mb-1">Booking Confirmed!</h3>
            <p className="text-muted small">
              Your tickets are ready. A confirmation email has also been dispatched.
            </p>
          </div>

          {/* Ticket Card Aesthetic */}
          <div className="ticket-card p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="badge bg-danger mb-1">E-TICKET</span>
                <h4 className="fw-bold text-light mb-0">{booking.movie?.title}</h4>
                <div className="text-muted small">
                  {booking.theatre?.name} • Screen {booking.screenNumber}
                </div>
              </div>
              <img
                src={booking.movie?.posterUrl}
                alt="poster"
                className="rounded-2"
                style={{ width: '55px', height: '75px', objectFit: 'cover' }}
              />
            </div>

            <div className="row g-2 small text-muted my-3 bg-dark p-3 rounded-3">
              <div className="col-6">
                <span className="d-block text-secondary">Date & Time</span>
                <strong className="text-light">
                  {booking.showDate} • {booking.showTime}
                </strong>
              </div>
              <div className="col-6">
                <span className="d-block text-secondary">Reserved Seats</span>
                <strong className="text-success fs-6">{booking.seats?.join(', ')}</strong>
              </div>
              <div className="col-6 mt-2">
                <span className="d-block text-secondary">Booking Reference</span>
                <strong className="text-warning font-monospace">{booking.bookingReference}</strong>
              </div>
              <div className="col-6 mt-2">
                <span className="d-block text-secondary">Total Paid</span>
                <strong className="text-light">
                  ${booking.totalAmount?.toFixed(2)} ({booking.paymentStatus})
                </strong>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="ticket-divider"></div>

            {/* Scannable QR Code */}
            <div className="text-center py-2">
              {booking.qrCodeData ? (
                <img
                  src={booking.qrCodeData}
                  alt="QR Code"
                  className="img-fluid p-2 bg-white rounded-3 mb-2"
                  style={{ width: '150px', height: '150px' }}
                />
              ) : (
                <div className="p-3 bg-white text-dark d-inline-block rounded-3 mb-2 font-monospace">
                  [SCANNABLE QR CODE]
                </div>
              )}
              <div className="text-secondary small">
                Scan this barcode at the cinema counter or entry turnstile.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3 mt-4">
            <button className="btn btn-outline-light flex-fill rounded-pill py-2" onClick={handlePrint}>
              <i className="bi bi-printer me-2"></i> Print / Save PDF
            </button>
            <Link to="/dashboard" className="btn btn-danger flex-fill rounded-pill py-2 fw-semibold">
              <i className="bi bi-ticket-perforated me-2"></i> View in Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
