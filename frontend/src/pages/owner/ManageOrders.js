import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import { OrderStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/business/orders${query}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/business/orders/${orderId}/status`, {
        status: newStatus,
        note: `Status updated by kitchen to ${newStatus}`,
      });

      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title="Customer Orders Queue"
          subtitle="Track pre-orders, advance kitchen preparation stages, and manage order fulfillment."
        />

        {/* Status Filter Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom pb-3 flex-wrap">
          {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map(
            (status) => (
              <button
                key={status}
                className={`btn btn-sm rounded-pill px-3 fw-medium ${
                  statusFilter === status ? 'btn-danger' : 'btn-outline-secondary'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'ALL' ? 'All Orders' : status}
              </button>
            )
          )}
        </div>

        {loading ? (
          <Loader message="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-4 border shadow-sm">
            <i className="bi bi-receipt display-4 text-muted opacity-50 mb-3 d-block"></i>
            <h4 className="fw-bold">No orders found</h4>
            <p className="text-muted">No orders matching this status filter.</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="bg-light small text-muted">
                  <tr>
                    <th className="ps-4">Order #</th>
                    <th>Customer</th>
                    <th>Batch</th>
                    <th>Prep Date</th>
                    <th>Items</th>
                    <th>Fulfillment</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Quick Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td className="ps-4 py-3 fw-bold">
                        <Link to={`/owner/orders/${ord._id}`} className="text-dark">
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <strong>{ord.customer?.name}</strong>
                        <small className="text-muted d-block">{ord.contactPhone || ord.customer?.phone}</small>
                      </td>
                      <td className="small">{ord.batch?.batchName}</td>
                      <td className="small text-muted">
                        {ord.batch?.preparationDate
                          ? new Date(ord.batch.preparationDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>{ord.items?.length || 0}</td>
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {ord.fulfillmentType}
                        </span>
                      </td>
                      <td className="fw-bold text-danger">
                        ₹{Number(ord.totalAmount).toFixed(2)}
                      </td>
                      <td>
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td className="text-end pe-4">
                        <div className="dropdown d-inline-block">
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            Advance
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow border-0 small">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => handleUpdateStatus(ord._id, 'CONFIRMED')}
                              >
                                <span className="badge bg-info me-2">&bull;</span> Confirm Order
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => handleUpdateStatus(ord._id, 'PREPARING')}
                              >
                                <span className="badge bg-primary me-2">&bull;</span> Move to Kitchen Prep
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => handleUpdateStatus(ord._id, 'READY')}
                              >
                                <span className="badge bg-success me-2">&bull;</span> Mark Ready For Pickup
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => handleUpdateStatus(ord._id, 'COMPLETED')}
                              >
                                <span className="badge bg-dark me-2">&bull;</span> Complete Order
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleUpdateStatus(ord._id, 'REJECTED')}
                              >
                                <span className="badge bg-danger me-2">&bull;</span> Decline / Reject
                              </button>
                            </li>
                          </ul>
                        </div>
                        <Link
                          to={`/owner/orders/${ord._id}`}
                          className="btn btn-sm btn-link text-muted ms-1"
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageOrders;
