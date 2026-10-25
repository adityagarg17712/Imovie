import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SeatGrid from '../components/SeatGrid';
import { movieService } from '../services/movieService';
import { useBooking } from '../context/BookingContext';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const {
    selectedSeats,
    setActiveShow,
    setActiveMovie,
    subtotal,
    convenienceFee,
    taxes,
    totalAmount,
  } = useBooking();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowAndSeats = async () => {
      setLoading(true);
      try {
        const res = await movieService.getShowDetailsAndSeats(showId);
        if (res.data) {
          setShow(res.data.show);
          setSeats(res.data.seats);
          setActiveShow(res.data.show);
          setActiveMovie(res.data.show.movie);
        }
      } catch (err) {
        console.error('Fetch show seats error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (showId) {
      fetchShowAndSeats();
    }
  }, [showId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading seats...</span>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h3>Show not found</h3>
        <Link to="/" className="btn btn-outline-danger mt-3">
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Show Header Summary */}
      <div className="card bg-card border border-secondary rounded-4 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger">{show.screenType || 'IMAX'}</span>
              <span className="badge bg-secondary">Screen {show.screenNumber}</span>
              <span className="text-muted small">
                {show.date} • {show.startTime}
              </span>
            </div>
            <h3 className="fw-bold text-light mb-0">{show.movie?.title}</h3>
            <p className="text-muted small mb-0">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
              {show.theatre?.name}, {show.theatre?.city}
            </p>
          </div>

          <Link to={`/movie/${show.movie?._id}`} className="btn btn-outline-light btn-sm rounded-pill px-3">
            <i className="bi bi-arrow-left me-1"></i> Change Showtime
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Interactive Seat Layout */}
        <div className="col-lg-8">
          <SeatGrid showId={show._id} initialSeats={seats} pricing={show.pricing} />
        </div>

        {/* Booking Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card bg-card border border-secondary rounded-4 p-4 sticky-top shadow" style={{ top: '80px' }}>
            <h5 className="fw-bold text-light mb-3 pb-2 border-bottom border-secondary">
              Booking Summary
            </h5>

            <div className="mb-3">
              <div className="text-muted small">Selected Seats:</div>
              {selectedSeats.length === 0 ? (
                <div className="text-secondary small fst-italic py-2">
                  Please tap on the seat map to pick your seats (max 8 seats)
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2 py-2">
                  {selectedSeats.map((s) => (
                    <span key={s.seatNumber} className="badge bg-success p-2 fs-6">
                      {s.seatNumber}
                      <span className="small text-white-50 ms-1">(${s.price})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="small text-muted border-top border-secondary pt-3 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span>Tickets Subtotal ({selectedSeats.length})</span>
                <span className="text-light">${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Convenience Fee</span>
                <span className="text-light">${convenienceFee.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Integrated Taxes (8%)</span>
                <span className="text-light">${taxes.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fs-5 fw-bold text-light border-top border-secondary pt-2 mt-1">
                <span>Total Payable</span>
                <span className="text-danger">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-danger w-100 rounded-pill py-3 fw-bold mt-4 shadow"
              disabled={selectedSeats.length === 0}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Payment <i className="bi bi-arrow-right ms-1"></i>
            </button>

            <div className="text-center mt-3 text-secondary" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-shield-lock-fill text-success me-1"></i>
              Real-time seat reservation with instant confirmation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
