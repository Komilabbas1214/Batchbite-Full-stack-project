import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cartBatch, cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const savedFulfillment = sessionStorage.getItem('bb_fulfillment') || 'PICKUP';
  const [fulfillmentType] = useState(savedFulfillment);

  const [formData, setFormData] = useState({
    contactPhone: user?.phone || '',
    deliveryAddress: user?.address || '',
    customerNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!cartBatch || cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4>No active items to checkout</h4>
        <Link to="/batches" className="btn btn-bb-primary mt-3">
          Browse Batches
        </Link>
      </div>
    );
  }

  const deliveryFee =
    fulfillmentType === 'DELIVERY' && cartBatch.deliveryAvailable
      ? Number(cartBatch.deliveryFee || 0)
      : 0;
  const totalAmount = cartSubtotal + deliveryFee;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (fulfillmentType === 'DELIVERY' && !formData.deliveryAddress.trim()) {
      setError('Please provide a delivery address for local delivery.');
      return;
    }

    if (!formData.contactPhone.trim()) {
      setError('Please provide a contact phone number for order updates.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        fulfillmentType,
        deliveryAddress: formData.deliveryAddress,
        contactPhone: formData.contactPhone,
        customerNotes: formData.customerNotes,
        items: cartItems.map((item) => ({
          batchItemId: item.batchItemId,
          quantity: item.quantity,
        })),
      };

      const res = await api.post(`/batches/${cartBatch._id}/orders`, payload);

      if (res.data.success) {
        clearCart();
        sessionStorage.removeItem('bb_fulfillment');
        toast.success('Your pre-order has been placed successfully!');
        navigate(`/customer/orders/${res.data.order._id}`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to place order. A product may have sold out or the deadline passed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="max-w-700 mx-auto mb-4">
          <Link to="/cart" className="text-muted small text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i> Back to Cart
          </Link>
          <h1 className="fw-extrabold mt-2 mb-1">Confirm Pre-Order</h1>
          <p className="text-muted">
            Batch: <strong>{cartBatch.batchName}</strong> by {cartBatch.business?.name}
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          {/* Order Details Form */}
          <div className="col-lg-7">
            <div className="card p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white">
              <h5 className="fw-bold mb-4">Fulfillment & Contact Information</h5>

              {error && (
                <div className="alert alert-danger py-2 small mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitOrder}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Recipient Name</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={user?.name || ''}
                    disabled
                  />
                  <small className="text-muted">Linked to your account</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Contact Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="contactPhone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">The chef will notify you via SMS when fresh and ready.</small>
                </div>

                {fulfillmentType === 'DELIVERY' ? (
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Delivery Address *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="deliveryAddress"
                      placeholder="Street address, apartment/unit, city, zip code..."
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                ) : (
                  <div className="alert alert-light border rounded-3 p-3 mb-3">
                    <h6 className="fw-bold mb-1 small text-dark">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i> Porch Pickup Location
                    </h6>
                    <p className="mb-0 small text-secondary">
                      {cartBatch.pickupLocation || cartBatch.business?.address || cartBatch.business?.city}
                    </p>
                    {cartBatch.pickupInstructions && (
                      <small className="text-muted d-block mt-1">
                        Instructions: {cartBatch.pickupInstructions}
                      </small>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Special Notes for the Chef</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    name="customerNotes"
                    placeholder="Dietary specifications, porch arrival notes, slicing preference..."
                    value={formData.customerNotes}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-bb-primary w-100 py-3 fw-bold shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Reserving Batch Portions...
                    </>
                  ) : (
                    `Confirm & Place Pre-Order (₹${totalAmount.toFixed(2)})`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Summary */}
          <div className="col-lg-5">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
              <h5 className="fw-bold mb-3">Order Summary</h5>
              <div className="border-bottom pb-3 mb-3">
                {cartItems.map((item) => (
                  <div key={item.batchItemId} className="d-flex justify-content-between mb-2 small">
                    <div>
                      <strong className="d-block">{item.product?.name}</strong>
                      <span className="text-muted">
                        Qty: {item.quantity} &times; ₹{Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    <span className="fw-bold">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-semibold">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Fulfillment ({fulfillmentType}):</span>
                <span className="fw-semibold">
                  {deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE (Pickup)'}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-4">
                <strong className="fs-5">Total Due:</strong>
                <strong className="fs-4 text-danger">₹{totalAmount.toFixed(2)}</strong>
              </div>

              <div className="bg-light p-3 rounded-3 border small text-muted">
                <i className="bi bi-shield-check text-success me-1"></i>
                <strong>Zero Waste Guarantee:</strong> Quantities are reserved unconditionally upon order placement.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
