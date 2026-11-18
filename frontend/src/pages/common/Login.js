import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide your email address and password');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setError(res.message);
      toast.error(res.message);
    }
  };

  // Quick fill helper for evaluator
  const handleQuickFill = (role) => {
    if (role === 'owner') {
      setFormData({ email: 'owner@batchbite.com', password: 'password123' });
    } else {
      setFormData({ email: 'customer@batchbite.com', password: 'password123' });
    }
    setError('');
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="card p-4 p-sm-5 border-0 shadow-lg rounded-4 bg-white">
              <div className="text-center mb-4">
                <span className="fs-1">🥐</span>
                <h3 className="fw-bold mt-2 mb-1">Welcome to BatchBite</h3>
                <p className="text-muted small">Sign in to manage your kitchen or track pre-orders</p>
              </div>

              {/* Quick Fill Credentials Banner */}
              <div className="bg-light p-3 rounded-3 border mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="fw-bold text-dark">Demo Quick-Fill:</small>
                  <span className="badge bg-secondary small">Click to autofill</span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm flex-fill"
                    onClick={() => handleQuickFill('owner')}
                  >
                    <i className="bi bi-shop me-1"></i> Owner Demo
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm flex-fill"
                    onClick={() => handleQuickFill('customer')}
                  >
                    <i className="bi bi-person me-1"></i> Customer Demo
                  </button>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold small mb-0">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-key text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-bb-primary w-100 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top small text-muted">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-danger fw-bold text-decoration-none">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
