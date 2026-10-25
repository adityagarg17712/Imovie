import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('user@imovies.com');
    setPassword('User@Password123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('Admin@Password123');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card bg-card border border-secondary rounded-4 p-4 p-md-5 shadow-lg">
            <div className="text-center mb-4">
              <Link to="/" className="brand-logo justify-content-center mb-2">
                <i className="bi bi-film text-danger"></i>
                <span>I</span>Movies
              </Link>
              <h4 className="fw-bold text-light">Welcome Back</h4>
              <p className="text-muted small">Sign in to book cinema tickets and manage reservations</p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 small mb-4">
                <i className="bi bi-exclamation-circle me-2"></i> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small text-muted">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label small text-muted">Password</label>
                <input
                  type="password"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-danger rounded-pill py-2 fw-semibold mt-2 shadow"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Credentials for Grading/Testing */}
            <div className="mt-4 pt-3 border-top border-secondary text-center">
              <span className="small text-muted d-block mb-2">Instant Demo Autofill:</span>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-pill px-3"
                  onClick={fillDemoUser}
                >
                  <i className="bi bi-person me-1"></i> Demo User
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning rounded-pill px-3"
                  onClick={fillDemoAdmin}
                >
                  <i className="bi bi-shield-lock me-1"></i> Demo Admin
                </button>
              </div>
            </div>

            <div className="text-center mt-4 small text-muted">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-danger text-decoration-none fw-semibold">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
