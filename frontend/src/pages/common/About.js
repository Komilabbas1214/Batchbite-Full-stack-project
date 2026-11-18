import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-700 mx-auto mb-5">
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-pill fw-semibold mb-2">
            Our Mission & Story
          </span>
          <h1 className="fw-extrabold display-5">Why We Built BatchBite</h1>
          <p className="lead text-muted">
            Revitalizing the connection between artisanal home food creators and the neighborhoods they feed.
          </p>
        </div>

        {/* Story Grid */}
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <h3 className="fw-bold mb-3">The Problem With Commercial Kitchens</h3>
            <p className="text-muted">
              Traditional restaurants operate on guesswork. They prepare food hoping customers walk in, resulting in up to 30% food waste every single day. Meanwhile, home bakers and cottage chefs who pour their souls into long-fermentation sourdough or slow-cooked recipes get overwhelmed managing orders over fragmented social media DMs and spreadsheets.
            </p>
            <p className="text-muted">
              <strong>BatchBite changes the paradigm:</strong> By structuring sales around transparent pre-order batches, food producers only cook what has already been reserved and paid for. No waste, zero guesswork, and 100% fresh meals.
            </p>
            <div className="row g-3 mt-2">
              <div className="col-6">
                <div className="p-3 bg-white rounded-3 border shadow-sm">
                  <h4 className="fw-bold text-danger mb-1">0%</h4>
                  <small className="text-muted">Food waste through planned batching</small>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-white rounded-3 border shadow-sm">
                  <h4 className="fw-bold text-success mb-1">100%</h4>
                  <small className="text-muted">Guaranteed fresh on preparation date</small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
              alt="Baker preparing dough"
              className="img-fluid rounded-4 shadow-lg border"
            />
          </div>
        </div>

        {/* Core Pillars */}
        <div className="py-5 border-top">
          <div className="text-center mb-5">
            <h3 className="fw-bold">Our Core Pillars</h3>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm rounded-4 bg-white">
                <div className="fs-2 mb-2">🧑‍🍳</div>
                <h5 className="fw-bold">Empowering Cottage Chefs</h5>
                <p className="text-muted small mb-0">
                  We give passionate cooks enterprise-grade tools: inventory limits, batch scheduling, automated order tracking, and sales analytics.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm rounded-4 bg-white">
                <div className="fs-2 mb-2">🛡️</div>
                <h5 className="fw-bold">Inventory Integrity</h5>
                <p className="text-muted small mb-0">
                  Our system uses atomic inventory reservation to ensure customers never overbook a batch beyond kitchen capacity.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 shadow-sm rounded-4 bg-white">
                <div className="fs-2 mb-2">🤝</div>
                <h5 className="fw-bold">Community Connection</h5>
                <p className="text-muted small mb-0">
                  Know your baker, know your chef. Pick up directly from neighborhood cottage kitchens and savor authentic recipes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white p-5 rounded-4 border shadow-sm mt-4">
          <h3 className="fw-bold mb-2">Ready to taste the difference?</h3>
          <p className="text-muted mb-4">
            Browse active batches or start accepting orders for your culinary creations today.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/batches" className="btn btn-bb-primary">
              View Available Batches
            </Link>
            <Link to="/register" className="btn btn-bb-outline">
              Join BatchBite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
