import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import OrderStatusTracker from '../../components/customer/OrderStatusTracker';
import { OrderStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setCancelling(true);

    try {
      const res = await api.patch(`/orders/${id}/cancel`, { reason: cancelReason });
      if (res.data.success) {
        toast.success('Your order has been cancelled and items released back to inventory.');
        setCancelModalOpen(false);
        setOrder(res.data.order);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Loading order tracking details..." />;
  }

  if (error || !order) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger py-4">
          <h5>{error || 'Order not found'}</h5>
          <Link to="/customer/orders" className="btn btn-outline-danger mt-3">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  // Check cancellation eligibility
  const deadline = order.batch?.orderDeadline ? new Date(order.batch.orderDeadline) : null;
  const isPastDeadline = deadline ? new Date() > deadline : false;
  const canCancel =
    ['PENDING', 'CONFIRMED'].includes(order.status) && !isPastDeadline;

  return (
    <div className="py-5">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/customer/dashboard">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/customer/orders">My Pre-Orders</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{order.orderNumber}</li>
          </ol>
        </nav>

        {/* Order Header Card */}
        <div className="card p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom mb-4">
            <div>
              <span className="badge bg-light text-dark border px-3 py-2 fs-6 mb-2">
                Order #{order.orderNumber}
              </span>
              <p className="text-muted small mb-0">
                Placed on {new Date(order.createdAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <OrderStatusBadge status={order.status} />
              {canCancel && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setCancelModalOpen(true)}
                >
                  <i className="bi bi-x-circle me-1"></i> Cancel Pre-Order
                </button>
              )}
            </div>
          </div>

          {/* Lifecycle tracker */}
          <h5 className="fw-bold mb-1">Pre-Order Progress</h5>
          <OrderStatusTracker
            status={order.status}
            statusHistory={order.statusHistory}
          />
        </div>

        <div className="row g-4">
          {/* Items Breakdown */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
              <div className="p-4 border-bottom">
                <h5 className="fw-bold mb-0">Order Snapshot</h5>
                <small className="text-muted">
                  Batch: <strong>{order.batch?.batchName}</strong>
                </small>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="bg-light small text-muted">
                    <tr>
                      <th className="ps-4">Item Name</th>
                      <th>Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end pe-4">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="ps-4 py-3 fw-bold text-dark">
                          {item.name}
                        </td>
                        <td>₹{Number(item.price).toFixed(2)}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end pe-4 fw-bold">
                          ₹{Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-light border-top">
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Subtotal:</span>
                  <span className="fw-semibold">₹{Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Fulfillment ({order.fulfillmentType}):</span>
                  <span className="fw-semibold">₹{Number(order.deliveryFee).toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="fs-5">Total Paid / Due:</strong>
                  <strong className="fs-4 text-danger">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            {order.customerNotes && (
              <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
                <h6 className="fw-bold mb-1">Notes Provided for the Kitchen:</h6>
                <p className="text-muted mb-0 small fst-italic">"{order.customerNotes}"</p>
              </div>
            )}
          </div>

          {/* Kitchen & Pickup Information Sidebar */}
          <div className="col-lg-5">
            {/* Business Contact */}
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
              <h5 className="fw-bold mb-3">Kitchen Profile</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                {order.business?.logoUrl ? (
                  <img
                    src={order.business.logoUrl}
                    alt={order.business.name}
                    className="rounded-circle border"
                    style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px' }}
                  >
                    🍳
                  </div>
                )}
                <div>
                  <h6 className="fw-bold mb-0">{order.business?.name}</h6>
                  <small className="text-muted">{order.business?.city || 'Artisan Kitchen'}</small>
                </div>
              </div>

              {order.business?.phone && (
                <div className="small text-muted mb-2">
                  <i className="bi bi-telephone me-2 text-danger"></i>
                  <strong>Phone:</strong> {order.business.phone}
                </div>
              )}
              {order.business?.email && (
                <div className="small text-muted">
                  <i className="bi bi-envelope me-2 text-danger"></i>
                  <strong>Email:</strong> {order.business.email}
                </div>
              )}
            </div>

            {/* Pickup / Delivery Card */}
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
              <h5 className="fw-bold mb-3">
                {order.fulfillmentType === 'DELIVERY' ? 'Delivery Destination' : 'Porch Pickup Location'}
              </h5>

              {order.fulfillmentType === 'DELIVERY' ? (
                <div>
                  <p className="mb-2 small text-dark">
                    <strong>Address:</strong> {order.deliveryAddress}
                  </p>
                  <p className="mb-0 small text-muted">
                    <strong>Contact Phone:</strong> {order.contactPhone}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-2 small text-dark">
                    <strong>Pickup Address:</strong>{' '}
                    {order.batch?.pickupLocation || order.business?.address || order.business?.city}
                  </p>
                  {order.batch?.pickupInstructions && (
                    <div className="alert alert-light border small text-muted mb-0">
                      <strong>Instructions:</strong> {order.batch.pickupInstructions}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cancellation Policy explanation */}
            <div className="card p-3 border-0 bg-light rounded-4 small text-muted">
              <h6 className="fw-bold mb-1 text-dark">
                <i className="bi bi-info-circle me-1 text-primary"></i> Cancellation Policy
              </h6>
              Pre-orders can be cancelled freely while in <strong>Pending</strong> or <strong>Confirmed</strong> status up until the batch order deadline. Once cooking begins or the deadline passes, cancellations are closed.
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        {cancelModalOpen && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Cancel Pre-Order</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setCancelModalOpen(false)}
                  ></button>
                </div>
                <form onSubmit={handleCancelOrder}>
                  <div className="modal-body py-3">
                    <p className="small text-muted mb-3">
                      Are you sure you want to cancel Order <strong>#{order.orderNumber}</strong>? Your reserved quantities will be returned to the batch inventory.
                    </p>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">
                        Reason for Cancellation (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="e.g. Schedule conflict, placed by mistake..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setCancelModalOpen(false)}
                      disabled={cancelling}
                    >
                      Keep Order
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={cancelling}
                    >
                      {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
