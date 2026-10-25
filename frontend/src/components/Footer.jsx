import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-top border-secondary mt-5 pt-5 pb-4 bg-black text-muted">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="brand-logo text-light mb-3 d-inline-flex">
              <i className="bi bi-film text-danger"></i>
              <span>I</span>Movies
            </Link>
            <p className="small text-secondary pe-lg-4">
              IMovies delivers the ultimate next-generation online cinema booking experience.
              Browse premier releases, check live seat availability in real time, and enjoy effortless ticket reservations.
            </p>
            <div className="d-flex gap-3 text-secondary fs-5 mt-3">
              <a href="#twitter" className="text-secondary text-hover-light"><i className="bi bi-twitter-x"></i></a>
              <a href="#facebook" className="text-secondary"><i className="bi bi-facebook"></i></a>
              <a href="#instagram" className="text-secondary"><i className="bi bi-instagram"></i></a>
              <a href="#youtube" className="text-secondary"><i className="bi bi-youtube"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-light text-uppercase fw-bold mb-3 small">Browse</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="text-secondary text-decoration-none">Now Showing</Link></li>
              <li><Link to="/" className="text-secondary text-decoration-none">Upcoming Movies</Link></li>
              <li><Link to="/" className="text-secondary text-decoration-none">IMAX Theatres</Link></li>
              <li><Link to="/" className="text-secondary text-decoration-none">Special Screenings</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-light text-uppercase fw-bold mb-3 small">Account & Support</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/dashboard" className="text-secondary text-decoration-none">My Bookings</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none">User Sign In</Link></li>
              <li><a href="#terms" className="text-secondary text-decoration-none">Cancellation Policy</a></li>
              <li><a href="#faq" className="text-secondary text-decoration-none">Help Center & FAQ</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-light text-uppercase fw-bold mb-3 small">Cinema Experience</h6>
            <p className="small text-secondary mb-2">
              Equipped with Dolby Atmos, IMAX with Laser, and Real-Time Seat Reservation.
            </p>
            <div className="d-flex align-items-center gap-2 mt-3">
              <span className="badge bg-danger p-2"><i className="bi bi-shield-check me-1"></i> 100% Secure Checkout</span>
            </div>
          </div>
        </div>

        <div className="border-top border-secondary pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <p className="mb-0">© {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.</p>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <a href="#privacy" className="text-secondary text-decoration-none">Privacy Policy</a>
            <a href="#terms" className="text-secondary text-decoration-none">Terms of Service</a>
            <a href="#security" className="text-secondary text-decoration-none">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
