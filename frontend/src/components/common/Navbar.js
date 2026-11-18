import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bb-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand bb-brand" to="/">
          <span className="fs-3">🥐</span>
          <span>Batch<span style={{ color: 'var(--bb-accent)' }}>Bite</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Main navigation links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <NavLink className="nav-link bb-nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link bb-nav-link" to="/batches">
                Available Batches
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link bb-nav-link" to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link bb-nav-link" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>

          {/* Right-side user controls & cart */}
          <div className="d-flex align-items-center gap-2">
            {/* Cart Button (Always visible for customers and guests) */}
            {!isOwner && (
              <Link to="/cart" className="btn btn-light position-relative rounded-pill px-3 py-2 border shadow-sm">
                <i className="bi bi-basket2 text-danger fs-5"></i>
                <span className="ms-1 fw-bold d-none d-sm-inline">Cart</span>
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {totalItems}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}
                  >
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="fw-semibold d-none d-md-inline">{user?.name}</span>
                  <span className="badge bg-light text-dark border ms-1 small">
                    {isOwner ? 'Owner' : 'Customer'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2" aria-labelledby="userDropdown">
                  <li className="dropdown-header text-muted small">
                    Signed in as <strong className="d-block text-dark">{user?.email}</strong>
                  </li>
                  <li><hr className="dropdown-divider" /></li>

                  {isOwner ? (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/owner/dashboard">
                          <i className="bi bi-speedometer2 text-danger me-2"></i> Owner Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/owner/batches">
                          <i className="bi bi-calendar2-range text-danger me-2"></i> Manage Batches
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/owner/products">
                          <i className="bi bi-egg-fried text-danger me-2"></i> Food Products
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/owner/orders">
                          <i className="bi bi-receipt text-danger me-2"></i> Customer Orders
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/owner/business-profile">
                          <i className="bi bi-shop text-danger me-2"></i> Business Profile
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/customer/dashboard">
                          <i className="bi bi-grid text-danger me-2"></i> Customer Hub
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/customer/orders">
                          <i className="bi bi-bag-check text-danger me-2"></i> My Pre-Orders
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/customer/profile">
                          <i className="bi bi-person-gear text-danger me-2"></i> Account Settings
                        </Link>
                      </li>
                    </>
                  )}

                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item py-2 text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-bb-outline btn-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-bb-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
