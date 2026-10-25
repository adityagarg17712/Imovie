import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useBooking } from '../context/BookingContext';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity, setActiveMovie, setActiveShow } = useBooking();

  const [movie, setMovie] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [theatreShows, setTheatreShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        const res = await movieService.getMovieById(id);
        if (res.data) {
          setMovie(res.data.movie);
          setActiveMovie(res.data.movie);
          const dates = res.data.availableDates || [];
          setAvailableDates(dates);
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
          } else {
            // Default to today
            const today = new Date().toISOString().slice(0, 10);
            setSelectedDate(today);
          }
        }
      } catch (err) {
        console.error('Fetch movie error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;

    const fetchShows = async () => {
      setShowsLoading(true);
      try {
        const res = await movieService.getShows({
          movie: id,
          date: selectedDate,
          city: selectedCity,
        });
        setTheatreShows(res.data || []);
      } catch (err) {
        console.error('Fetch shows error:', err.message);
      } finally {
        setShowsLoading(false);
      }
    };

    fetchShows();
  }, [id, selectedDate, selectedCity]);

  const handleSelectShow = (theatre, show) => {
    setActiveShow({
      ...show,
      theatre,
      movie,
    });
    navigate(`/seat-selection/${show._id}`);
  };

  const formatDateLabel = (dateStr) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    return { day, dayNum, month };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading movie...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h3>Movie not found</h3>
      </div>
    );
  }

  return (
    <div>
      {/* Movie Details Header */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.95) 30%, rgba(15,23,42,0.8) 100%), url(${
            movie.backdropUrl || movie.posterUrl
          })`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '440px',
        }}
      >
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="img-fluid rounded-4 shadow-lg border border-secondary"
                style={{ maxHeight: '420px', objectFit: 'cover' }}
              />
            </div>

            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap gap-2 mb-2">
                <span className="badge bg-danger">{movie.certificate || 'UA'}</span>
                {movie.formats?.map((f) => (
                  <span key={f} className="badge bg-secondary">
                    {f}
                  </span>
                ))}
              </div>

              <h1 className="display-5 fw-bold text-light mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-3">
                {movie.rating > 0 && (
                  <span className="text-warning fw-bold fs-6">
                    <i className="bi bi-star-fill me-1"></i> {movie.rating.toFixed(1)}/10
                  </span>
                )}
                <span>•</span>
                <span>{movie.durationMinutes} mins</span>
                <span>•</span>
                <span>{movie.languages?.join(', ')}</span>
                <span>•</span>
                <span>{movie.genres?.join(', ')}</span>
              </div>

              <p className="text-light text-opacity-75 fs-6 mb-4" style={{ maxWidth: '720px' }}>
                {movie.description}
              </p>

              <div className="row g-3 small text-muted mb-4">
                <div className="col-sm-6">
                  <strong className="text-light d-block">Director:</strong>
                  <span>{movie.director || 'N/A'}</span>
                </div>
                <div className="col-sm-6">
                  <strong className="text-light d-block">Starring Cast:</strong>
                  <span>{movie.cast?.join(', ') || 'N/A'}</span>
                </div>
              </div>

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light rounded-pill px-4"
                >
                  <i className="bi bi-play-circle-fill me-2 text-danger"></i> Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Theatre Selection Section */}
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom border-secondary">
          <div>
            <h3 className="fw-bold text-light mb-1">Select Date & Showtimes</h3>
            <p className="text-muted small mb-0">
              Showing available theatres in <span className="text-danger fw-semibold">{selectedCity}</span>
            </p>
          </div>

          {/* Date Picker Buttons */}
          <div className="d-flex gap-2 overflow-auto py-1">
            {availableDates.map((d) => {
              const label = formatDateLabel(d);
              const isSelected = selectedDate === d;
              return (
                <button
                  key={d}
                  type="button"
                  className={`btn d-flex flex-column align-items-center px-3 py-2 rounded-3 border ${
                    isSelected ? 'btn-danger text-light' : 'btn-dark text-secondary border-secondary'
                  }`}
                  style={{ minWidth: '70px' }}
                  onClick={() => setSelectedDate(d)}
                >
                  <span className="small text-uppercase">{label.day}</span>
                  <span className="fs-5 fw-bold">{label.dayNum}</span>
                  <span className="small text-uppercase">{label.month}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theatres & Shows List */}
        {showsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="mt-2 text-muted small">Checking show schedules...</p>
          </div>
        ) : theatreShows.length === 0 ? (
          <div className="text-center py-5 bg-card rounded-4 border border-secondary p-4">
            <i className="bi bi-calendar-x text-muted display-4 mb-3 d-block"></i>
            <h5>No shows available for this date in {selectedCity}</h5>
            <p className="text-muted small">
              Try selecting another date or check other nearby cities from the city selector.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {theatreShows.map(({ theatre, shows }) => (
              <div
                key={theatre._id}
                className="card bg-card border border-secondary rounded-4 p-4 shadow-sm"
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-3 border-bottom border-secondary">
                  <div>
                    <h5 className="fw-bold text-light mb-1">
                      <i className="bi bi-geo-alt text-danger me-2"></i>
                      {theatre.name}
                    </h5>
                    <p className="text-muted small mb-0">{theatre.address}</p>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {theatre.amenities?.map((a) => (
                      <span key={a} className="badge bg-dark border border-secondary text-secondary">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3">
                  {shows.map((show) => (
                    <button
                      key={show._id}
                      className="btn btn-outline-light rounded-3 px-3 py-2 text-center"
                      style={{ minWidth: '130px' }}
                      onClick={() => handleSelectShow(theatre, show)}
                    >
                      <div className="fw-bold text-light fs-6">{show.startTime}</div>
                      <div className="badge bg-secondary text-light mt-1 small">
                        {show.screenType || 'IMAX'}
                      </div>
                      <div className="small text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                        {show.availableSeats} seats left
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;
