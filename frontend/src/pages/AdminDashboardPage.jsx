import React, { useEffect, useState } from 'react';
import { movieService } from '../services/movieService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [theatresList, setTheatresList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Movie Form State
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDesc, setMovieDesc] = useState('');
  const [moviePoster, setMoviePoster] = useState('');
  const [movieBackdrop, setMovieBackdrop] = useState('');
  const [movieGenres, setMovieGenres] = useState('Sci-Fi, Action');
  const [movieDuration, setMovieDuration] = useState(140);
  const [movieRating, setMovieRating] = useState(8.5);

  // New Show Form State
  const [showMovieId, setShowMovieId] = useState('');
  const [showTheatreId, setShowTheatreId] = useState('');
  const [showDate, setShowDate] = useState(new Date().toISOString().slice(0, 10));
  const [showStartTime, setShowStartTime] = useState('18:00');
  const [showEndTime, setShowEndTime] = useState('20:45');
  const [showPriceSilver, setShowPriceSilver] = useState(15);
  const [showPriceGold, setShowPriceGold] = useState(22);
  const [showPriceVip, setShowPriceVip] = useState(35);

  const [formMsg, setFormMsg] = useState('');

  const loadAdminData = async () => {
    try {
      const statsRes = await movieService.getAdminStats();
      if (statsRes.data) {
        setStats(statsRes.data.stats);
        setRecentBookings(statsRes.data.recentBookings || []);
      }

      const moviesRes = await movieService.getMovies({ limit: 50 });
      setMoviesList(moviesRes.data || []);
      if (moviesRes.data?.length > 0) setShowMovieId(moviesRes.data[0]._id);

      const theatresRes = await movieService.getTheatres();
      setTheatresList(theatresRes.data || []);
      if (theatresRes.data?.length > 0) setShowTheatreId(theatresRes.data[0]._id);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await movieService.createMovie({
        title: movieTitle,
        description: movieDesc,
        posterUrl: moviePoster,
        backdropUrl: movieBackdrop,
        genres: movieGenres.split(',').map((g) => g.trim()),
        languages: ['English'],
        durationMinutes: Number(movieDuration),
        rating: Number(movieRating),
        releaseDate: new Date(),
        status: 'NOW_SHOWING',
      });
      setFormMsg('Movie added successfully!');
      setMovieTitle('');
      setMovieDesc('');
      setMoviePoster('');
      loadAdminData();
      setTimeout(() => setFormMsg(''), 4000);
    } catch (err) {
      setFormMsg(err.message || 'Error creating movie');
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await movieService.createShow({
        movie: showMovieId,
        theatre: showTheatreId,
        screenNumber: 1,
        date: showDate,
        startTime: showStartTime,
        endTime: showEndTime,
        pricing: {
          silver: Number(showPriceSilver),
          gold: Number(showPriceGold),
          vip: Number(showPriceVip),
        },
      });
      setFormMsg('Show scheduled and seats generated successfully!');
      loadAdminData();
      setTimeout(() => setFormMsg(''), 4000);
    } catch (err) {
      setFormMsg(err.message || 'Error scheduling show');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-light mb-1">
            <i className="bi bi-speedometer2 text-danger me-2"></i> Cinema Admin Control Panel
          </h2>
          <p className="text-muted small mb-0">
            Real-time analytics, inventory management, and show scheduling
          </p>
        </div>

        <button className="btn btn-outline-light btn-sm rounded-pill" onClick={loadAdminData}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
        </button>
      </div>

      {formMsg && <div className="alert alert-info py-2 small mb-4">{formMsg}</div>}

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-5">
        <div className="col-sm-6 col-lg-3">
          <div className="card bg-card border border-secondary rounded-4 p-3 shadow-sm">
            <span className="text-muted small">Total System Revenue</span>
            <h3 className="fw-bold text-success mt-1 mb-0">${stats?.totalRevenue || 0}</h3>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card bg-card border border-secondary rounded-4 p-3 shadow-sm">
            <span className="text-muted small">Total Bookings</span>
            <h3 className="fw-bold text-light mt-1 mb-0">{stats?.totalBookings || 0}</h3>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card bg-card border border-secondary rounded-4 p-3 shadow-sm">
            <span className="text-muted small">Scheduled Shows</span>
            <h3 className="fw-bold text-warning mt-1 mb-0">{stats?.totalShows || 0}</h3>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card bg-card border border-secondary rounded-4 p-3 shadow-sm">
            <span className="text-muted small">Listed Movies</span>
            <h3 className="fw-bold text-info mt-1 mb-0">{stats?.totalMovies || 0}</h3>
          </div>
        </div>
      </div>

      {/* Management Forms */}
      <div className="row g-4 mb-5">
        {/* Schedule Show Form */}
        <div className="col-lg-6">
          <div className="card bg-card border border-secondary rounded-4 p-4 shadow-sm h-100">
            <h5 className="fw-bold text-light mb-3">
              <i className="bi bi-calendar-plus text-danger me-2"></i> Schedule New Show
            </h5>
            <form onSubmit={handleCreateShow} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small text-muted">Movie</label>
                <select
                  className="form-select bg-dark text-light border-secondary shadow-none"
                  value={showMovieId}
                  onChange={(e) => setShowMovieId(e.target.value)}
                  required
                >
                  {moviesList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label small text-muted">Theatre Location</label>
                <select
                  className="form-select bg-dark text-light border-secondary shadow-none"
                  value={showTheatreId}
                  onChange={(e) => setShowTheatreId(e.target.value)}
                  required
                >
                  {theatresList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label small text-muted">Date</label>
                  <input
                    type="date"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small text-muted">Start Time</label>
                  <input
                    type="time"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={showStartTime}
                    onChange={(e) => setShowStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small text-muted">End Time</label>
                  <input
                    type="time"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={showEndTime}
                    onChange={(e) => setShowEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label small text-muted">Silver ($)</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={showPriceSilver}
                    onChange={(e) => setShowPriceSilver(e.target.value)}
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small text-muted">Gold ($)</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={showPriceGold}
                    onChange={(e) => setShowPriceGold(e.target.value)}
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small text-muted">VIP ($)</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={showPriceVip}
                    onChange={(e) => setShowPriceVip(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-danger rounded-pill mt-2 fw-semibold">
                Generate & Schedule Show
              </button>
            </form>
          </div>
        </div>

        {/* Add Movie Form */}
        <div className="col-lg-6">
          <div className="card bg-card border border-secondary rounded-4 p-4 shadow-sm h-100">
            <h5 className="fw-bold text-light mb-3">
              <i className="bi bi-film text-danger me-2"></i> Add New Movie
            </h5>
            <form onSubmit={handleCreateMovie} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small text-muted">Movie Title</label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  placeholder="e.g. Inception 2"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label small text-muted">Description / Plot</label>
                <textarea
                  rows="2"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  value={movieDesc}
                  onChange={(e) => setMovieDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small text-muted">Poster URL</label>
                  <input
                    type="url"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    placeholder="https://..."
                    value={moviePoster}
                    onChange={(e) => setMoviePoster(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-muted">Backdrop URL</label>
                  <input
                    type="url"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    placeholder="https://..."
                    value={movieBackdrop}
                    onChange={(e) => setMovieBackdrop(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small text-muted">Genres (comma separated)</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={movieGenres}
                    onChange={(e) => setMovieGenres(e.target.value)}
                  />
                </div>
                <div className="col-3">
                  <label className="form-label small text-muted">Duration (m)</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={movieDuration}
                    onChange={(e) => setMovieDuration(e.target.value)}
                  />
                </div>
                <div className="col-3">
                  <label className="form-label small text-muted">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    className="form-control bg-dark text-light border-secondary shadow-none"
                    value={movieRating}
                    onChange={(e) => setMovieRating(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-outline-danger rounded-pill mt-2 fw-semibold">
                Add Movie to Catalogue
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card bg-card border border-secondary rounded-4 p-4 shadow-sm">
        <h5 className="fw-bold text-light mb-3">Recent System Bookings</h5>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small">
                <th>Reference</th>
                <th>User</th>
                <th>Movie & Theatre</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No bookings logged yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="font-monospace text-warning small">{b.bookingReference}</td>
                    <td>
                      <div className="small fw-semibold">{b.user?.name || 'Customer'}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {b.user?.email}
                      </div>
                    </td>
                    <td>
                      <div className="small fw-semibold">{b.movie?.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {b.theatre?.name}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{b.seats?.join(', ')}</span>
                    </td>
                    <td className="fw-bold text-light">${b.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'CONFIRMED' ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
