import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const {
    cartBatch,
    cartItems,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fulfillmentType, setFulfillmentType] = useState('PICKUP');

  if (!cartBatch || cartItems.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '65vh' }}>
        <div className="py-5">
          <i className="bi bi-basket2 display-1 text-muted opacity-50 mb-3 d-block"></i>
          <h2 className="fw-bold">Your Pre-Order Cart is Empty</h2>
          <p className="text-muted max-w-500 mx-auto mb-4">
            Browse our artisanal home food creators and reserve portions from upcoming batches before deadlines close.
          </p>
          <Link to="/batches" className="btn btn-bb-primary btn-lg">
            <i className="bi bi-compass me-2"></i> Browse Available Batches
          </Link>
        </div>
      </div>
    );
  }

  const prepDate = new Date(cartBatch.preparationDate);
  const deadline = new Date(cartBatch.orderDeadline);
  const deliveryFee =
    fulfillmentType === 'DELIVERY' && cartBatch.deliveryAvailable
      ? Number(cartBatch.deliveryFee || 0)
      : 0;
  const totalAmount = cartSubtotal + deliveryFee;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      // Store chosen fulfillment type for checkout
      sessionStorage.setItem('bb_fulfillment', fulfillmentType);
      navigate('/checkout');
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-extrabold mb-1">Pre-Order Shopping Cart</h1>
            <p className="text-muted mb-0">
              Review your reserved portions for <strong>{cartBatch.batchName}</strong>
            </p>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={clearCart}
          >
            <i className="bi bi-trash me-1"></i> Clear Cart
          </button>
        </div>

        {/* Batch Notice Banner */}
        <div className="card p-3 p-md-4 rounded-4 border-0 shadow-sm bg-white mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 mb-1">
                Batch Schedule
              </span>
              <h5 className="fw-bold mb-1">{cartBatch.batchName}</h5>
              <div className="small text-muted">
                <span className="me-3">
                  <i className="bi bi-calendar-check text-success me-1"></i>
                  Prep Date: {prepDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span>
                  <i className="bi bi-clock text-danger me-1"></i>
                  Deadline: {deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <Link to={`/batches/${cartBatch._id}`} className="btn btn-outline-danger btn-sm">
                Add More Items From This Batch
              </Link>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Items List */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="p-4 border-bottom">
                <h5 className="fw-bold mb-0">Reserved Items</h5>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="bg-light small text-muted">
                    <tr>
                      <th className="ps-4">Product</th>
                      <th>Price</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end pe-4">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.batchItemId}>
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={
                                item.product?.imageUrl ||
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={item.product?.name}
                              className="rounded-3 border"
                              style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong className="d-block text-dark">
                                {item.product?.name}
                              </strong>
                              <small className="text-muted">
                                {item.product?.portionSize || '1 portion'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="fw-semibold">
                          ₹{Number(item.price).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <div className="input-group input-group-sm justify-content-center" style={{ width: '100px', margin: '0 auto' }}>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => updateQuantity(item.batchItemId, item.quantity - 1)}
                              disabled={item.quantity <= (item.minOrder || 1)}
                            >
                              -
                            </button>
                            <input
                              type="text"
                              readOnly
                              className="form-control text-center bg-white p-0"
                              value={item.quantity}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => updateQuantity(item.batchItemId, item.quantity + 1)}
                              disabled={item.quantity >= Math.min(item.availableQuantity, item.maxOrder)}
                            >
                              +
                            </button>
                          </div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            Max {Math.min(item.availableQuantity, item.maxOrder)}
                          </small>
                        </td>
                        <td className="text-end fw-bold pe-4">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <button
                            className="btn btn-link text-danger p-0 me-3"
                            onClick={() => removeFromCart(item.batchItemId)}
                            title="Remove"
                          >
                            <i className="bi bi-x-circle fs-5"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Checkout & Fulfillment Sidebar */}
          <div className="col-lg-4">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
              <h5 className="fw-bold mb-3">Fulfillment Method</h5>

              <div className="mb-4">
                <div className="form-check p-3 border rounded-3 mb-2 bg-light">
                  <input
                    className="form-check-input ms-0 me-2"
                    type="radio"
                    name="fulfillment"
                    id="pickupRadio"
                    checked={fulfillmentType === 'PICKUP'}
                    onChange={() => setFulfillmentType('PICKUP')}
                  />
                  <label className="form-check-label fw-bold d-block" htmlFor="pickupRadio">
                    <i className="bi bi-bag-check text-primary me-1"></i> Porch Pickup (Free)
                    <small className="d-block fw-normal text-muted mt-1">
                      Pick up directly from {cartBatch.pickupLocation || cartBatch.business?.city || 'the kitchen porch'}.
                    </small>
                  </label>
                </div>

                {cartBatch.deliveryAvailable ? (
                  <div className="form-check p-3 border rounded-3 bg-light">
                    <input
                      className="form-check-input ms-0 me-2"
                      type="radio"
                      name="fulfillment"
                      id="deliveryRadio"
                      checked={fulfillmentType === 'DELIVERY'}
                      onChange={() => setFulfillmentType('DELIVERY')}
                    />
                    <label className="form-check-label fw-bold d-block" htmlFor="deliveryRadio">
                      <i className="bi bi-bicycle text-success me-1"></i> Local Delivery (+₹{Number(cartBatch.deliveryFee).toFixed(2)})
                      <small className="d-block fw-normal text-muted mt-1">
                        Delivered to your address on the preparation date.
                      </small>
                    </label>
                  </div>
                ) : (
                  <small className="text-muted d-block mt-2">
                    <i className="bi bi-info-circle me-1"></i> Delivery is not offered for this batch.
                  </small>
                )}
              </div>

              <h5 className="fw-bold mb-3">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Items Subtotal:</span>
                <span className="fw-semibold">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Delivery Fee:</span>
                <span className="fw-semibold">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-4">
                <strong className="fs-5">Estimated Total:</strong>
                <strong className="fs-4 text-danger">₹{totalAmount.toFixed(2)}</strong>
              </div>

              <button
                className="btn btn-bb-primary w-100 py-3 fw-bold shadow-sm"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
