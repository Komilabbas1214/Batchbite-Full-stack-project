import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import { BatchStatusBadge, OrderStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const OwnerBatchDetails = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatchAndOrders = async () => {
    try {
      const [batchRes, ordersRes] = await Promise.all([
        api.get(`/batches/${id}`),
        api.get(`/business/orders?batchId=${id}`),
      ]);

      if (batchRes.data.success) {
        setBatch(batchRes.data.batch);
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders);
      }
    } catch (err) {
      toast.error('Failed to load batch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchAndOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/batches/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Batch status updated to ${newStatus}`);
        setBatch((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <Loader fullScreen message="Loading batch details & orders..." />
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <div className="alert alert-danger py-4">
            <h5>Batch not found</h5>
            <Link to="/owner/batches" className="btn btn-outline-danger mt-2">
              Back to Batches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const prepDate = new Date(batch.preparationDate);
  const deadline = new Date(batch.orderDeadline);
  const totalBatchRevenue = orders
    .filter((o) => !['CANCELLED', 'REJECTED'].includes(o.status))
    .reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title={batch.batchName}
          subtitle={`Scheduled preparation: ${prepDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}`}
          actions={
            <div className="d-flex gap-2 align-items-center">
              <Link to="/owner/batches" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-arrow-left me-1"></i> Back to Batches
              </Link>
              <Link to={`/batches/${batch._id}`} target="_blank" className="btn btn-outline-danger btn-sm">
                <i className="bi bi-box-arrow-up-right me-1"></i> View Storefront
              </Link>
            </div>
          }
        />

        {/* Batch Overview Banner */}
        <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom mb-3">
            <div className="d-flex align-items-center gap-3">
              <BatchStatusBadge status={batch.status} />
              <span className="text-muted small">
                Order Deadline: <strong>{deadline.toLocaleString()}</strong>
              </span>
            </div>

            {/* Status change actions */}
            <div className="d-flex gap-2 flex-wrap">
              {batch.status === 'OPEN' && (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleStatusChange('CLOSED')}
                >
                  <i className="bi bi-lock me-1"></i> Close Orders
                </button>
              )}
              {['OPEN', 'CLOSED'].includes(batch.status) && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStatusChange('PREPARING')}
                >
                  <i className="bi bi-fire me-1"></i> Begin Kitchen Prep
                </button>
              )}
              {batch.status === 'PREPARING' && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleStatusChange('READY')}
                >
                  <i className="bi bi-check-circle me-1"></i> Mark Ready For Pickup
                </button>
              )}
              {batch.status === 'READY' && (
                <button
                  className="btn btn-dark btn-sm"
                  onClick={() => handleStatusChange('COMPLETED')}
                >
                  <i className="bi bi-trophy me-1"></i> Complete Batch
                </button>
              )}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <small className="text-muted d-block">Confirmed Batch Revenue</small>
              <h4 className="fw-bold text-danger mb-0">₹{totalBatchRevenue.toFixed(2)}</h4>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Orders Received</small>
              <h4 className="fw-bold text-dark mb-0">{orders.length}</h4>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Pickup Location</small>
              <span className="fw-semibold small text-truncate d-block">
                {batch.pickupLocation || 'Kitchen Porch'}
              </span>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Delivery</small>
              <span className="fw-semibold small">
                {batch.deliveryAvailable ? `Available (₹${batch.deliveryFee})` : 'Pickup Only'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Capacity & Booking Status */}
        <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
          <h5 className="fw-bold mb-3">Product Capacities in this Batch</h5>
          <div className="row g-3">
            {batch.items?.map((item) => {
              const bookedPct = Math.round((item.orderedQuantity / item.maxQuantity) * 100);
              return (
                <div className="col-md-6 col-xl-4" key={item._id}>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <img
                        src={
                          item.product?.imageUrl ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'
                        }
                        alt={item.product?.name}
                        className="rounded-3 border"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong className="d-block text-dark text-truncate" style={{ maxWidth: '180px' }}>
                          {item.product?.name}
                        </strong>
                        <span className="text-muted small">
                          ₹{Number(item.price).toFixed(2)} / portion
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Booked: {item.orderedQuantity} / {item.maxQuantity}</span>
                      <strong className="text-dark">{item.availableQuantity} remaining</strong>
                    </div>

                    <div className="progress" style={{ height: '7px' }}>
                      <div
                        className={`progress-bar ${
                          bookedPct >= 90 ? 'bg-danger' : bookedPct >= 50 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${bookedPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders Placed for this Batch */}
        <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Customer Orders for this Batch</h5>
            <span className="badge bg-light text-dark border">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No orders placed for this batch yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="bg-light small text-muted">
                  <tr>
                    <th>Order #</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td className="fw-bold">{ord.orderNumber}</td>
                      <td>{ord.customer?.name}</td>
                      <td className="small text-muted">{ord.contactPhone || ord.customer?.phone}</td>
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {ord.fulfillmentType}
                        </span>
                      </td>
                      <td>{ord.items?.length}</td>
                      <td className="fw-bold text-danger">
                        ₹{Number(ord.totalAmount).toFixed(2)}
                      </td>
                      <td>
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td>
                        <Link
                          to={`/owner/orders/${ord._id}`}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerBatchDetails;
