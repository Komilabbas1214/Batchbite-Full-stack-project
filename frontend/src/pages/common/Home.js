import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import BatchCard from '../../components/customer/BatchCard';
import Loader from '../../components/common/Loader';

const Home = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpenBatches = async () => {
      try {
        const res = await api.get('/batches?limit=6');
        if (res.data.success) {
          setBatches(res.data.batches);
        }
      } catch (err) {
        console.error('Error fetching home batches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenBatches();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bb-hero py-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill fw-semibold mb-3">
                <i className="bi bi-stars me-1"></i> Pre-Order Marketplace for Home Food Creators
              </span>
              <h1 className="display-4 fw-extrabold mb-3 lh-sm">
                Artisanal Food Cooked in <span className="text-danger">Small Batches</span>, Pre-Ordered by You.
              </h1>
              <p className="lead text-muted mb-4 pe-lg-5">
                Discover local bakers and home chefs cooking exclusive seasonal batches. Reserve your portion before the deadline and experience food made with heart—never mass-produced.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/batches" className="btn btn-bb-primary btn-lg shadow-sm">
                  <i className="bi bi-compass me-2"></i> Explore Open Batches
                </Link>
                <Link to="/register?role=owner" className="btn btn-bb-outline btn-lg">
                  <i className="bi bi-shop me-2"></i> Start Your Kitchen
                </Link>
              </div>

              {/* Highlights */}
              <div className="row mt-5 pt-3 border-top g-3">
                <div className="col-sm-4">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-3">🥖</span>
                    <div>
                      <div className="fw-bold text-dark">Freshly Made</div>
                      <small className="text-muted">Cooked day of pickup</small>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-3">🌱</span>
                    <div>
                      <div className="fw-bold text-dark">Zero Food Waste</div>
                      <small className="text-muted">Only cook what is pre-sold</small>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-3">🔒</span>
                    <div>
                      <div className="fw-bold text-dark">Safe Inventory</div>
                      <small className="text-muted">Capped batch capacity</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                  alt="Artisanal Bakes"
                  className="img-fluid rounded-4 shadow-lg border border-white border-4"
                  style={{ maxHeight: '480px', width: '100%', objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 start-0 translate-middle-y bg-white p-3 rounded-3 shadow-lg border ms-3 d-none d-sm-block">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-success bg-opacity-10 p-2 text-success">
                      <i className="bi bi-clock-history fs-4"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">Live Pre-Ordering</h6>
                      <small className="text-muted">Transparent order deadlines</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Batches Section */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-danger fw-bold text-uppercase small letter-spacing">
                Fresh From The Kitchen
              </span>
              <h2 className="fw-bold mt-1">Batches Open For Pre-Order</h2>
              <p className="text-muted mb-0">
                Reserve your items before the order deadline closes.
              </p>
            </div>
            <Link to="/batches" className="btn btn-outline-danger btn-sm mt-3 mt-md-0">
              View All Batches <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <Loader message="Loading active food batches..." />
          ) : batches.length === 0 ? (
            <div className="text-center p-5 bg-light rounded-4 border">
              <span className="fs-1">🥐</span>
              <h4 className="fw-bold mt-3">No active batches right now</h4>
              <p className="text-muted">
                Our home chefs are preparing the next batch schedule. Check back soon or create your own kitchen!
              </p>
              <Link to="/register?role=owner" className="btn btn-bb-primary mt-2">
                Open a Kitchen
              </Link>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {batches.map((batch) => (
                <div className="col" key={batch._id}>
                  <BatchCard batch={batch} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-1 rounded-pill fw-semibold mb-2">
              Simple & Transparent
            </span>
            <h2 className="fw-bold">How BatchBite Works</h2>
            <p className="text-muted">
              We connect passionate home food producers with conscious food lovers.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
                <div
                  className="rounded-circle bg-danger bg-opacity-10 text-danger mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px' }}
                >
                  <i className="bi bi-calendar-event fs-3"></i>
                </div>
                <h5 className="fw-bold">1. Discover A Batch</h5>
                <p className="text-muted small mb-0">
                  Browse limited food batches announced by local cottage chefs with fixed preparation dates and transparent menus.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
                <div
                  className="rounded-circle bg-warning bg-opacity-10 text-warning mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px' }}
                >
                  <i className="bi bi-cart-check fs-3 text-dark"></i>
                </div>
                <h5 className="fw-bold">2. Pre-Order & Lock In</h5>
                <p className="text-muted small mb-0">
                  Select your items and order before the deadline. BatchBite locks in inventory and ensures kitchen capacity isn't overbooked.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
                <div
                  className="rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px' }}
                >
                  <i className="bi bi-box2-heart fs-3"></i>
                </div>
                <h5 className="fw-bold">3. Pick Up Piping Hot</h5>
                <p className="text-muted small mb-0">
                  Follow porch pickup instructions or receive local delivery on the scheduled preparation day. Fresh, warm, and zero waste!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Callout Banner */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="p-5 rounded-4 bg-dark text-white position-relative overflow-hidden shadow-lg">
            <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
              <div className="col-lg-8">
                <span className="badge bg-danger px-3 py-2 rounded-pill mb-3">
                  For Home Bakers & Chefs
                </span>
                <h2 className="fw-bold text-white display-6 mb-3">
                  Turn Your Culinary Passion into a Thriving Business.
                </h2>
                <p className="text-secondary lead mb-4">
                  Manage inventory safely, eliminate food waste, track orders, and monitor sales analytics with BatchBite's creator suite.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/register?role=owner" className="btn btn-bb-primary btn-lg">
                    Register As Business Owner
                  </Link>
                  <Link to="/about" className="btn btn-outline-light btn-lg">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
