import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'customer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    phone: '',
    address: '',
    businessName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role') === 'owner') {
      setFormData((prev) => ({ ...prev, role: 'owner' }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      address: formData.address,
      businessName: formData.role === 'owner' ? formData.businessName : undefined,
    });

    setLoading(false);

    if (res.success) {
      toast.success(`Account registered successfully as ${res.user.role}!`);
      if (res.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setError(res.message);
      toast.error(res.message);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '85vh' }}>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-7">
            <div className="card p-4 p-sm-5 border-0 shadow-lg rounded-4 bg-white">
              <div className="text-center mb-4">
                <span className="fs-1">🥖</span>
                <h3 className="fw-bold mt-2 mb-1">Create Your BatchBite Account</h3>
                <p className="text-muted small">Join our community of artisanal food creators and lovers</p>
              </div>

              {/* Role Selection Tabs */}
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <div
                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                    className={`p-3 text-center rounded-3 border cursor-pointer transition ${
                      formData.role === 'customer'
                        ? 'border-danger bg-danger bg-opacity-10 text-danger fw-bold'
                        : 'bg-light text-muted'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-person-heart fs-4 d-block mb-1"></i>
                    <span>Customer</span>
                    <small className="d-block text-muted fw-normal" style={{ fontSize: '0.75rem' }}>
                      Pre-order artisanal food
                    </small>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    onClick={() => setFormData({ ...formData, role: 'owner' })}
                    className={`p-3 text-center rounded-3 border cursor-pointer transition ${
                      formData.role === 'owner'
                        ? 'border-danger bg-danger bg-opacity-10 text-danger fw-bold'
                        : 'bg-light text-muted'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-shop fs-4 d-block mb-1"></i>
                    <span>Business Owner</span>
                    <small className="d-block text-muted fw-normal" style={{ fontSize: '0.75rem' }}>
                      Cook & manage food batches
                    </small>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g. Elena Rostova"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {formData.role === 'owner' && (
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Kitchen / Brand Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="businessName"
                        placeholder="e.g. Hearth & Stone Sourdough"
                        value={formData.businessName}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Password (Min 6 chars) *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Address / Pickup Area</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      placeholder="City or Street Address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-bb-primary w-100 py-2 fw-bold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating Account...
                        </>
                      ) : (
                        `Register as ${formData.role === 'owner' ? 'Business Owner' : 'Customer'}`
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <div className="text-center mt-4 pt-3 border-top small text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-danger fw-bold text-decoration-none">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
