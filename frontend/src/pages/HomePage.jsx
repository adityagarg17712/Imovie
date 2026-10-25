import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { movieService } from '../services/movieService';
import { useBooking } from '../context/BookingContext';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { selectedCity } = useBooking();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('NOW_SHOWING');
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');

  const search = searchParams.get('search') || '';

  useEffect(() => {
    // Load filter options
    const loadFilters = async () => {
      try {
        const res = await movieService.getFilterOptions();
        if (res.data) {
          setGenres(['All Genres', ...res.data.genres]);
          setLanguages(['All Languages', ...res.data.languages]);
        }
      } catch (err) {
        console.warn('Filter options fallback:', err.message);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = {
          status: activeTab,
          city: selectedCity,
          genre: selectedGenre,
          language: selectedLanguage,
          format: selectedFormat,
        };
        if (search) params.search = search;

        const res = await movieService.getMovies(params);
        setMovies(res.data || []);
      } catch (err) {
        console.error('Fetch movies error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeTab, selectedCity, selectedGenre, selectedLanguage, selectedFormat, search]);

  const featuredMovie = movies[0];

  return (
    <div className="container py-4">
      {/* Hero Banner (Only shown when not searching) */}
      {!search && featuredMovie && (
        <div
          className="hero-banner mb-5"
          style={{
            backgroundImage: `url(${featuredMovie.backdropUrl || featuredMovie.posterUrl})`,
          }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <span className="badge bg-danger text-uppercase px-3 py-1 mb-2">Featured Premiere</span>
            <h1 className="display-4 fw-extrabold text-light mb-2">{featuredMovie.title}</h1>
            <p className="text-light text-opacity-75 fs-6 mb-3 line-clamp-2" style={{ maxWidth: '600px' }}>
              {featuredMovie.description}
            </p>
            <div className="d-flex flex-wrap align-items-center gap-3">
              <Link
                to={`/movie/${featuredMovie._id}`}
                className="btn btn-danger btn-lg rounded-pill px-4 fw-bold shadow-lg"
              >
                <i className="bi bi-ticket-perforated-fill me-2"></i> Book Tickets
              </Link>
              <a
                href={featuredMovie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-light btn-lg rounded-pill px-4"
              >
                <i className="bi bi-play-circle me-2"></i> Watch Trailer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Now Showing vs Coming Soon */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div className="btn-group p-1 bg-black rounded-pill border border-secondary">
          <button
            className={`btn btn-sm rounded-pill px-4 py-2 ${
              activeTab === 'NOW_SHOWING' ? 'btn-danger text-light' : 'btn-dark text-muted'
            }`}
            onClick={() => setActiveTab('NOW_SHOWING')}
          >
            Now Showing
          </button>
          <button
            className={`btn btn-sm rounded-pill px-4 py-2 ${
              activeTab === 'UPCOMING' ? 'btn-danger text-light' : 'btn-dark text-muted'
            }`}
            onClick={() => setActiveTab('UPCOMING')}
          >
            Coming Soon
          </button>
        </div>

        {/* Filter Controls */}
        <div className="d-flex flex-wrap gap-2">
          {/* Genre Filter */}
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary rounded-pill px-3 shadow-none"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{ width: 'auto' }}
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary rounded-pill px-3 shadow-none"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ width: 'auto' }}
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Format Filter */}
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary rounded-pill px-3 shadow-none"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="All Formats">All Formats</option>
            <option value="2D">2D</option>
            <option value="3D">3D</option>
            <option value="IMAX">IMAX</option>
            <option value="4DX">4DX</option>
          </select>
        </div>
      </div>

      {/* Search notification */}
      {search && (
        <div className="alert alert-dark border-secondary d-flex justify-content-between align-items-center mb-4">
          <span>
            Search results for: <strong>"{search}"</strong>
          </span>
          <Link to="/" className="btn btn-sm btn-outline-light rounded-pill">
            Clear Search
          </Link>
        </div>
      )}

      {/* Movies Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading movies...</span>
          </div>
          <p className="mt-3 text-muted small">Loading cinema showtimes for {selectedCity}...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-5 bg-card rounded-4 border border-secondary p-5">
          <i className="bi bi-camera-reels text-muted display-3 mb-3 d-block"></i>
          <h4>No movies found</h4>
          <p className="text-muted small">
            Try adjusting your search criteria, switching tabs, or changing your city.
          </p>
          <button
            className="btn btn-outline-danger btn-sm rounded-pill mt-2"
            onClick={() => {
              setSelectedGenre('All Genres');
              setSelectedLanguage('All Languages');
              setSelectedFormat('All Formats');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {movies.map((movie) => (
            <div key={movie._id} className="col">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
