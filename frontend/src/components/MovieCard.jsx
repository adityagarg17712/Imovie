import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <div className="movie-poster-wrap">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {movie.rating > 0 && (
          <div className="rating-badge">
            <i className="bi bi-star-fill text-warning me-1"></i>
            {movie.rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {movie.formats?.slice(0, 3).map((f) => (
              <span key={f} className="format-badge text-light">
                {f}
              </span>
            ))}
            <span className="format-badge text-warning">{movie.certificate || 'UA'}</span>
          </div>

          <h5 className="text-light fw-bold mb-1 text-truncate" title={movie.title}>
            {movie.title}
          </h5>

          <p className="text-muted small mb-2 text-truncate">
            {movie.genres?.join(', ') || 'Drama'}
          </p>
        </div>

        <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary">
          <span className="small text-secondary">
            <i className="bi bi-clock me-1"></i>
            {movie.durationMinutes}m
          </span>

          <Link
            to={`/movie/${movie._id}`}
            className="btn btn-danger btn-sm rounded-pill px-3 fw-medium"
          >
            Book Tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
