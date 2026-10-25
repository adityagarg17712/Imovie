import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';

const DashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const [bookings, setBookings] = useState({ upcoming: [], past: [] });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getUserBookings();
      if (res.data) {
        setBookings({
          upcoming: res.data.upcoming || [],
          past: res.data.past || [],
        });
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A 100% refund will be processed.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId, 'Cancelled from User Dashboard');
      alert('Booking cancelled successfully and seats released.');
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name: editName, phone: editPhone });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg(err.message || 'Error updating profile');
    }
  };

  const currentList = activeTab === 'upcoming' ? bookings.upcoming : bookings.past;

  return (
    <div className="container py-5">
      {/* User Profile Card */}
      <div className="card bg-card border border-secondary rounded-4 p-4 mb-5 shadow">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div className="d-flex align-items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt="Avatar"
              className="rounded-circle border border-danger"
              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
            />
            <div>
              <h4 className="fw-bold text-light mb-1">{user?.name}</h4>
              <div className="text-muted small">{user?.email}</div>
              <div className="text-secondary small">{user?.phone || 'No phone added'}</div>
            </div>
          </div>

          <div>
            <button
              className="btn btn-outline-light btn-sm rounded-pill px-3"
              data-bs-toggle="collapse"
              data-bs-target="#editProfileCollapse"
            >
              <i className="bi bi-pencil me-1"></i> Edit Profile
            </button>
          </div>
        </div>

        {/* Collapsible Profile Editor */}
        <div className="collapse mt-4 pt-3 border-top border-secondary" id="editProfileCollapse">
          {profileMsg && <div className="alert alert-info py-2 small mb-3">{profileMsg}</div>}
          <form onSubmit={handleUpdateProfile} className="row g-3">
            <div className="col-md-5">
              <label className="form-label small text-muted">Full Name</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary shadow-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-5">
              <label className="form-label small text-muted">Phone Number</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary shadow-none"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-danger w-100 rounded-pill">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-light mb-0">My Ticket Bookings</h3>

        <div className="btn-group p-1 bg-black rounded-pill border border-secondary">
          <button
            className={`btn btn-sm rounded-pill px-4 ${
              activeTab === 'upcoming' ? 'btn-danger text-light' : 'btn-dark text-muted'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({bookings.upcoming.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-4 ${
              activeTab === 'past' ? 'btn-danger text-light' : 'btn-dark text-muted'
            }`}
            onClick={() => setActiveTab('past')}
          >
            Past & Cancelled ({bookings.past.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
          <p className="mt-2 text-muted small">Loading your tickets...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-5 bg-card rounded-4 border border-secondary p-5">
          <i className="bi bi-ticket-perforated text-muted display-4 mb-3 d-block"></i>
          <h5>No {activeTab} bookings found</h5>
          <p className="text-muted small">Browse current showtimes and book your cinema seats.</p>
        </div>
      ) : (
        <div className="row g-4">
          {currentList.map((b) => (
            <div key={b._id} className="col-lg-6">
              <div className="card bg-card border border-secondary rounded-4 p-4 h-100 shadow-sm d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span
                      className={`badge ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-success'
                          : b.bookingStatus === 'CANCELLED'
                          ? 'bg-danger'
                          : 'bg-secondary'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                    <span className="small text-muted font-monospace">{b.bookingReference}</span>
                  </div>

                  <div className="d-flex gap-3 mb-3">
                    <img
                      src={b.movie?.posterUrl}
                      alt={b.movie?.title}
                      className="rounded-3 border border-secondary"
                      style={{ width: '65px', height: '95px', objectFit: 'cover' }}
                    />
                    <div>
                      <h5 className="fw-bold text-light mb-1">{b.movie?.title}</h5>
                      <div className="text-muted small">{b.theatre?.name}</div>
                      <div className="text-danger small fw-semibold">
                        <i className="bi bi-calendar3 me-1"></i> {b.showDate} at {b.showTime}
                      </div>
                      <div className="small text-light mt-1">
                        <strong>Seats:</strong> {b.seats?.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-top border-secondary pt-3 mt-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small d-block">Amount:</span>
                    <strong className="text-light">${b.totalAmount?.toFixed(2)}</strong>
                  </div>

                  {b.bookingStatus === 'CONFIRMED' && (
                    <button
                      className="btn btn-outline-danger btn-sm rounded-pill px-3"
                      disabled={cancellingId === b._id}
                      onClick={() => handleCancelBooking(b._id)}
                    >
                      {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
