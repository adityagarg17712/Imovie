import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register({ name, email, password, phone, role });
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
              <h4 className="fw-bold text-light">Create Account</h4>
              <p className="text-muted small">Join IMovies for instant cinema seat reservations</p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 small mb-4">
                <i className="bi bi-exclamation-circle me-2"></i> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small text-muted">Full Name</label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                <label className="form-label small text-muted">Phone Number</label>
                <input
                  type="tel"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label small text-muted">Password</label>
                <input
                  type="password"
                  className="form-control bg-dark text-light border-secondary shadow-none"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="form-label small text-muted">Account Type</label>
                <select
                  className="form-select bg-dark text-light border-secondary shadow-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">Standard Moviegoer</option>
                  <option value="admin">Cinema Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-danger rounded-pill py-2 fw-semibold mt-2 shadow"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center mt-4 small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-danger text-decoration-none fw-semibold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
