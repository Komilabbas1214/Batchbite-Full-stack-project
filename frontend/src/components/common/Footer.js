import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bb-footer">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <span>🥐</span>
              <span>Batch<span style={{ color: 'var(--bb-accent)' }}>Bite</span></span>
            </h5>
            <p className="small text-secondary pe-lg-4">
              Empowering home-based bakers, artisan cooks, and cottage kitchens to manage food batches, accept pre-orders with confidence, and serve fresh culinary magic to their local community.
            </p>
            <div className="d-flex gap-3 text-secondary mt-3">
              <span className="badge bg-dark border border-secondary px-3 py-2">
                <i className="bi bi-shield-lock me-1 text-success"></i> Safe Pre-Ordering
              </span>
              <span className="badge bg-dark border border-secondary px-3 py-2">
                <i className="bi bi-heart-fill me-1 text-danger"></i> Handcrafted Batches
              </span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/batches">Available Batches</Link></li>
              <li><Link to="/about">Our Philosophy</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
              <li><Link to="/register?role=owner">For Food Creators</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3">Accounts</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/customer/orders">Track Orders</Link></li>
              <li><Link to="/owner/dashboard">Owner Portal</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12">
            <h6 className="text-white fw-bold mb-3">Are You A Home Chef or Baker?</h6>
            <p className="small text-secondary mb-3">
              Stop guessing demand and risking food waste. With BatchBite, set your preparation schedule, cap quantities, and cook only what is pre-sold.
            </p>
            <Link to="/register?role=owner" className="btn btn-bb-primary btn-sm">
              <i className="bi bi-shop me-1"></i> Open Your Kitchen
            </Link>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} BatchBite. Full-Stack MERN Platform. All rights reserved.
          </p>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span className="text-muted">Fresh Batches</span>
            <span>&bull;</span>
            <span className="text-muted">Zero Waste</span>
            <span>&bull;</span>
            <span className="text-muted">Community Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
