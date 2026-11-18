import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center" style={{ minHeight: '65vh' }}>
      <div className="py-5">
        <span className="display-1 fw-bold text-danger">404</span>
        <h2 className="fw-bold mt-2 mb-3">Fresh Batch Not Found</h2>
        <p className="text-muted max-w-500 mx-auto mb-4">
          The page or food batch you're searching for might have finished, moved, or doesn't exist.
        </p>
        <Link to="/" className="btn btn-bb-primary">
          <i className="bi bi-house-door me-2"></i> Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
