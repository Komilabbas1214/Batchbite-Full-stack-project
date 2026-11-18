import React from 'react';
import { Link } from 'react-router-dom';
import { BatchStatusBadge } from '../common/Badge';

const BatchCard = ({ batch }) => {
  const prepDate = new Date(batch.preparationDate);
  const deadline = new Date(batch.orderDeadline);
  const now = new Date();
  const hoursLeft = Math.max(0, Math.round((deadline - now) / (1000 * 60 * 60)));

  // Calculate lowest price among items if available
  const prices = batch.items?.map((i) => i.price).filter((p) => typeof p === 'number') || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <div className="card h-100 bb-card shadow-sm border-0 d-flex flex-column">
      {/* Banner / Business Header */}
      <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          {batch.business?.logoUrl ? (
            <img
              src={batch.business.logoUrl}
              alt={batch.business.name}
              className="rounded-circle border"
              style={{ width: '38px', height: '38px', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '38px', height: '38px' }}
            >
              🍳
            </div>
          )}
          <div>
            <h6 className="mb-0 fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>
              {batch.business?.name || 'Artisan Kitchen'}
            </h6>
            <small className="text-muted">
              <i className="bi bi-geo-alt me-1 text-danger"></i>
              {batch.business?.city || 'Local Pickup'}
            </small>
          </div>
        </div>
        <BatchStatusBadge status={batch.status} />
      </div>

      <div className="card-body p-4 d-flex flex-column">
        <h5 className="card-title fw-bold text-dark mb-2">{batch.batchName}</h5>
        <p className="card-text text-muted small flex-grow-1" style={{ minHeight: '40px' }}>
          {batch.description
            ? batch.description.slice(0, 110) + (batch.description.length > 110 ? '...' : '')
            : 'Fresh artisanal batch prepared in limited quantities.'}
        </p>

        {/* Schedule box */}
        <div className="bg-light p-3 rounded-3 mb-3 border">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted">
              <i className="bi bi-calendar-check text-success me-1"></i> Prep Date:
            </span>
            <span className="fw-semibold small">
              {prepDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted">
              <i className="bi bi-clock-history text-danger me-1"></i> Order Closes:
            </span>
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 small">
              {hoursLeft > 24
                ? `${Math.floor(hoursLeft / 24)}d left`
                : `${hoursLeft} hrs left`}
            </span>
          </div>
        </div>

        {/* Products in this batch preview */}
        {batch.items && batch.items.length > 0 && (
          <div className="mb-3">
            <span className="text-muted small fw-medium d-block mb-1">
              {batch.items.length} {batch.items.length === 1 ? 'Product' : 'Products'} in Batch:
            </span>
            <div className="d-flex gap-1 flex-wrap">
              {batch.items.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="badge bg-white text-dark border small text-truncate"
                  style={{ maxWidth: '140px' }}
                >
                  {item.product?.name || 'Item'}
                </span>
              ))}
              {batch.items.length > 3 && (
                <span className="badge bg-secondary bg-opacity-10 text-secondary small">
                  +{batch.items.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Delivery / Pickup options */}
        <div className="d-flex gap-2 mb-3 small">
          <span className="badge bg-light text-dark border">
            <i className="bi bi-bag-check me-1 text-primary"></i> Pickup
          </span>
          {batch.deliveryAvailable && (
            <span className="badge bg-light text-dark border">
              <i className="bi bi-bicycle me-1 text-success"></i> Delivery (₹{Number(batch.deliveryFee).toFixed(2)})
            </span>
          )}
        </div>

        {/* Bottom row: Price & Button */}
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
          <div>
            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>From</small>
            <span className="fs-5 fw-bold text-dark">
              {minPrice !== null ? `₹${minPrice.toFixed(2)}` : 'Varies'}
            </span>
          </div>
          <Link to={`/batches/${batch._id}`} className="btn btn-bb-primary btn-sm px-3">
            Pre-Order Now <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BatchCard;
