import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/customer/ProductCard';
import { BatchStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const BatchDetails = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart, cartBatch, cartItems, cartSubtotal } = useCart();

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await api.get(`/batches/${id}`);
        if (res.data.success) {
          setBatch(res.data.batch);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load details for this batch.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [id]);

  if (loading) {
    return <Loader fullScreen message="Loading batch details and menu..." />;
  }

  if (error || !batch) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger py-4">
          <i className="bi bi-exclamation-octagon fs-2 d-block mb-2"></i>
          <h5>{error || 'Batch not found'}</h5>
          <Link to="/batches" className="btn btn-outline-danger mt-3">
            Back to Available Batches
          </Link>
        </div>
      </div>
    );
  }

  const prepDate = new Date(batch.preparationDate);
  const deadline = new Date(batch.orderDeadline);
  const now = new Date();
  const isExpired = now > deadline;
  const isCurrentBatchInCart = cartBatch && cartBatch._id === batch._id;

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/batches">Available Batches</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{batch.batchName}</li>
          </ol>
        </nav>

        {/* Batch Hero Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5 bg-white">
          <div
            className="p-4 p-md-5 text-white position-relative"
            style={{
              background: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url(${
                batch.business?.bannerUrl ||
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
              }) center/cover no-repeat`,
            }}
          >
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
              <span className="badge bg-danger px-3 py-2 rounded-pill fw-semibold">
                Batch Pre-Order
              </span>
              <BatchStatusBadge status={batch.status} />
            </div>

            <h1 className="display-5 fw-extrabold text-white mb-2">{batch.batchName}</h1>
            <p className="lead text-white-50 max-w-700 mb-4">{batch.description}</p>

            <div className="d-flex align-items-center gap-3">
              {batch.business?.logoUrl ? (
                <img
                  src={batch.business.logoUrl}
                  alt={batch.business.name}
                  className="rounded-circle border border-2 border-white"
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '48px', height: '48px' }}
                >
                  🍳
                </div>
              )}
              <div>
                <h6 className="mb-0 text-white fw-bold">{batch.business?.name}</h6>
                <small className="text-white-50">
                  <i className="bi bi-geo-alt me-1"></i>
                  {batch.business?.city || 'Local Neighborhood'}
                </small>
              </div>
            </div>
          </div>

          {/* Schedule Bar */}
          <div className="p-4 bg-light border-top">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-success bg-opacity-10 text-success p-3">
                    <i className="bi bi-calendar-check fs-4"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block">Preparation Date</small>
                    <strong className="text-dark">
                      {prepDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-danger bg-opacity-10 text-danger p-3">
                    <i className="bi bi-clock-history fs-4"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block">Order Deadline</small>
                    <strong className={isExpired ? 'text-danger' : 'text-dark'}>
                      {deadline.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isExpired && ' (CLOSED)'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-3">
                    <i className="bi bi-bag-check fs-4"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block">Fulfillment</small>
                    <strong className="text-dark">
                      Porch Pickup {batch.deliveryAvailable && `+ Local Delivery (₹${batch.deliveryFee})`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup & Kitchen Note */}
        {(batch.pickupInstructions || batch.pickupLocation) && (
          <div className="alert alert-info border-0 rounded-4 p-4 mb-5 shadow-sm">
            <div className="d-flex gap-3 align-items-start">
              <i className="bi bi-info-circle-fill fs-3 text-info"></i>
              <div>
                <h6 className="fw-bold mb-1">Pickup Information & Kitchen Notes</h6>
                {batch.pickupLocation && (
                  <p className="mb-1 small">
                    <strong>Location:</strong> {batch.pickupLocation}
                  </p>
                )}
                {batch.pickupInstructions && (
                  <p className="mb-0 small text-secondary">{batch.pickupInstructions}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="alert alert-warning rounded-4 p-3 mb-4 text-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            The deadline for this batch has closed. The chef is currently prepping the confirmed orders!
          </div>
        )}

        {/* Menu Items Grid + Cart Drawer */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">Menu for this Batch</h3>
              <span className="badge bg-light text-dark border px-3 py-2">
                {batch.items?.length || 0} Exclusive {batch.items?.length === 1 ? 'Dish' : 'Dishes'}
              </span>
            </div>

            {batch.items && batch.items.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-2 g-4">
                {batch.items.map((item) => (
                  <div className="col" key={item._id}>
                    <ProductCard
                      product={item.product}
                      batchItem={item}
                      batch={batch}
                      onAddToCart={addToCart}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-5 bg-white rounded-4 border">
                <p className="text-muted mb-0">No items configured for this batch yet.</p>
              </div>
            )}
          </div>

          {/* Right Column: Pre-Order Summary Widget */}
          <div className="col-lg-4">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white sticky-top" style={{ top: '90px' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
                <span>Current Pre-Order</span>
                <span className="badge bg-danger rounded-pill">
                  {isCurrentBatchInCart ? cartItems.length : 0} Items
                </span>
              </h5>

              {isCurrentBatchInCart && cartItems.length > 0 ? (
                <div>
                  <div className="border-bottom pb-3 mb-3">
                    <small className="text-muted d-block mb-2">Reserved for {batch.batchName}:</small>
                    {cartItems.map((cItem) => (
                      <div
                        key={cItem.batchItemId}
                        className="d-flex justify-content-between align-items-center mb-2 small"
                      >
                        <div>
                          <strong className="d-block">{cItem.product?.name}</strong>
                          <span className="text-muted">
                            {cItem.quantity} &times; ₹{Number(cItem.price).toFixed(2)}
                          </span>
                        </div>
                        <span className="fw-bold">
                          ₹{(cItem.quantity * cItem.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="fw-semibold">Estimated Subtotal:</span>
                    <span className="fs-5 fw-bold text-danger">
                      ₹{Number(cartSubtotal).toFixed(2)}
                    </span>
                  </div>

                  <Link to="/cart" className="btn btn-bb-primary w-100 py-2">
                    <i className="bi bi-cart-check me-2"></i> Review Cart & Checkout
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-basket2 fs-1 text-secondary opacity-50 mb-2 d-block"></i>
                  <p className="small mb-0">
                    Select quantities from the menu and click <strong>Add</strong> to start your pre-order.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetails;
