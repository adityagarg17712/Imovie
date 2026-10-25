import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

const CITIES = ['New York', 'Los Angeles', 'London', 'Mumbai', 'Chicago', 'Toronto'];

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity, setCity } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg cinema-navbar sticky-top py-2 px-3">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="brand-logo" to="/">
          <i className="bi bi-film text-danger"></i>
          <span>I</span>Movies
        </Link>

        {/* City Picker Pill */}
        <div className="dropdown ms-lg-4 my-2 my-lg-0">
          <button
            className="btn btn-outline-light btn-sm dropdown-toggle rounded-pill px-3 py-1 d-flex align-items-center gap-1"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-geo-alt-fill text-danger"></i>
            <span className="small">{selectedCity}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-dark shadow">
            <li>
              <h6 className="dropdown-header text-uppercase text-muted small">Select City</h6>
            </li>
            {CITIES.map((city) => (
              <li key={city}>
                <button
                  className={`dropdown-item ${selectedCity === city ? 'active' : ''}`}
                  onClick={() => setCity(city)}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Search Bar */}
        <form className="d-flex mx-lg-auto my-2 my-lg-0 w-50" onSubmit={handleSearchSubmit}>
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="search"
              className="form-control bg-dark text-light border-secondary shadow-none"
              placeholder="Search for movies, actors, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Navigation Actions */}
        <div className="d-flex align-items-center gap-3 ms-lg-3">
          <Link to="/" className="nav-link text-light small fw-medium">
            Movies
          </Link>

          {isAuthenticated ? (
            <div className="dropdown">
              <button
                className="btn btn-dark d-flex align-items-center gap-2 rounded-pill px-3 py-1 border border-secondary"
                data-bs-toggle="dropdown"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: '26px', height: '26px', objectFit: 'cover' }}
                />
                <span className="small text-truncate" style={{ maxWidth: '100px' }}>
                  {user.name}
                </span>
                <i className="bi bi-chevron-down small text-muted"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
                <li className="px-3 py-2 border-bottom border-secondary">
                  <div className="fw-bold small">{user.name}</div>
                  <div className="text-muted small">{user.email}</div>
                  {isAdmin && <span className="badge bg-danger mt-1">Admin</span>}
                </li>
                <li>
                  <Link className="dropdown-item py-2" to="/dashboard">
                    <i className="bi bi-ticket-perforated me-2 text-danger"></i> My Bookings
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link className="dropdown-item py-2" to="/admin">
                      <i className="bi bi-speedometer2 me-2 text-warning"></i> Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <hr className="dropdown-divider border-secondary" />
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 text-danger"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Log Out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">
                Log In
              </Link>
              <Link to="/register" className="btn btn-danger btn-sm rounded-pill px-3">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
