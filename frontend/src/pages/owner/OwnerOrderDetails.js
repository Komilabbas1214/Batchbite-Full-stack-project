import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import OrderStatusTracker from '../../components/customer/OrderStatusTracker';
import { OrderStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const OwnerOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
        setSelectedStatus(res.data.order.status);
      }
    } catch (err) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (selectedStatus === order.status) {
      toast.info('Selected status is the same as current status.');
      return;
    }

    if (
      ['CANCELLED', 'REJECTED'].includes(selectedStatus) &&
      !window.confirm(
        `Are you sure you want to mark this order as ${selectedStatus}? This will automatically release reserved quantities back to available inventory.`
      )
    ) {
      return;
    }

    setUpdating(true);

    try {
      const res = await api.patch(`/business/orders/${id}/status`, {
        status: selectedStatus,
        note: statusNote || `Status changed from ${order.status} to ${selectedStatus}`,
      });

      if (res.data.success) {
        toast.success(`Order status updated to ${selectedStatus}`);
        setOrder(res.data.order);
        setStatusNote('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <Loader fullScreen message="Loading order details..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <div className="alert alert-danger py-4">
            <h5>Order not found</h5>
            <Link to="/owner/orders" className="btn btn-outline-danger mt-2">
              Back to Orders Queue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFinalState = ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status);

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title={`Order #${order.orderNumber}`}
          subtitle={`Placed on ${new Date(order.createdAt).toLocaleString()} for ${order.batch?.batchName}`}
          actions={
            <Link to="/owner/orders" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Orders
            </Link>
          }
        />

        {/* Status Tracker */}
        <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="fw-bold mb-0">Order Progression</h5>
            <OrderStatusBadge status={order.status} />
          </div>
          <OrderStatusTracker
            status={order.status}
            statusHistory={order.statusHistory}
          />
        </div>

        <div className="row g-4">
          {/* Left Column: Order Items */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
              <div className="p-4 border-bottom">
                <h5 className="fw-bold mb-0">Pre-Ordered Items</h5>
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
                        <td className="ps-4 py-3 fw-bold">{item.name}</td>
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
                  <span className="text-muted">Items Subtotal:</span>
                  <span className="fw-semibold">₹{Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Delivery Fee ({order.fulfillmentType}):</span>
                  <span className="fw-semibold">₹{Number(order.deliveryFee).toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="fs-5">Total Amount:</strong>
                  <strong className="fs-4 text-danger">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            {order.customerNotes && (
              <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
                <h6 className="fw-bold mb-2 text-danger">
                  <i className="bi bi-chat-left-dots me-1"></i> Customer Kitchen Note
                </h6>
                <p className="text-dark mb-0 bg-light p-3 rounded-3 border small">
                  "{order.customerNotes}"
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Update Status & Customer Contact */}
          <div className="col-lg-5">
            {/* Status Update Card */}
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
              <h5 className="fw-bold mb-3">Update Order Status</h5>
              <form onSubmit={handleUpdateStatus}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Current Stage</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={isFinalState && order.status !== 'COMPLETED'}
                  >
                    <option value="PENDING">PENDING – Awaiting Kitchen Review</option>
                    <option value="CONFIRMED">CONFIRMED – Accepted by Kitchen</option>
                    <option value="PREPARING">PREPARING – In Kitchen / Cooking</option>
                    <option value="READY">READY – Packed & Ready for Pickup</option>
                    <option value="COMPLETED">COMPLETED – Handed to Customer</option>
                    <option value="REJECTED">REJECTED – Decline Order</option>
                    <option value="CANCELLED">CANCELLED – Cancel & Restore Inventory</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Status Note (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Sourdough taken out of oven, bagged on porch..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    disabled={isFinalState && order.status !== 'COMPLETED'}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-bb-primary w-100 py-2 fw-bold"
                  disabled={updating || (isFinalState && order.status !== 'COMPLETED')}
                >
                  {updating ? 'Updating...' : 'Update Order Stage'}
                </button>
              </form>
            </div>

            {/* Customer Details */}
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
              <h5 className="fw-bold mb-3">Customer Information</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '44px', height: '44px' }}
                >
                  {order.customer?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div>
                  <h6 className="fw-bold mb-0">{order.customer?.name}</h6>
                  <small className="text-muted">{order.customer?.email}</small>
                </div>
              </div>

              <div className="small text-muted mb-2">
                <i className="bi bi-telephone text-danger me-2"></i>
                <strong>Phone:</strong> {order.contactPhone || order.customer?.phone || 'Not provided'}
              </div>

              {order.fulfillmentType === 'DELIVERY' && (
                <div className="small text-muted mb-2">
                  <i className="bi bi-geo-alt text-danger me-2"></i>
                  <strong>Delivery Address:</strong> {order.deliveryAddress}
                </div>
              )}

              <div className="small text-muted">
                <i className="bi bi-box2 text-danger me-2"></i>
                <strong>Fulfillment Type:</strong> {order.fulfillmentType}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerOrderDetails;
