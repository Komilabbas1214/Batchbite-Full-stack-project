import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { OrderStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status);
    }
    if (filterStatus === 'COMPLETED') return o.status === 'COMPLETED';
    if (filterStatus === 'CANCELLED') {
      return ['CANCELLED', 'REJECTED'].includes(o.status);
    }
    return true;
  });

  return (
    <div className="py-5">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="fw-extrabold mb-1">My Pre-Orders</h1>
            <p className="text-muted mb-0">
              Track active batches, pickup windows, and your past orders.
            </p>
          </div>
          <Link to="/batches" className="btn btn-bb-primary btn-sm">
            <i className="bi bi-compass me-1"></i> Browse Open Batches
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom pb-3 flex-wrap">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-3 fw-medium ${
                filterStatus === tab
                  ? 'btn-danger'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => setFilterStatus(tab)}
            >
              {tab === 'ALL' && 'All Orders'}
              {tab === 'ACTIVE' && 'Active Pre-Orders'}
              {tab === 'COMPLETED' && 'Completed'}
              {tab === 'CANCELLED' && 'Cancelled / Declined'}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader message="Loading your pre-orders..." />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-4 border shadow-sm">
            <i className="bi bi-receipt display-4 text-muted opacity-50 mb-3 d-block"></i>
            <h4 className="fw-bold">No orders found in this view</h4>
            <p className="text-muted max-w-500 mx-auto mb-4">
              {filterStatus !== 'ALL'
                ? `You have no ${filterStatus.toLowerCase()} pre-orders.`
                : "You haven't placed any food pre-orders yet. Explore open batches in your area!"}
            </p>
            <Link to="/batches" className="btn btn-bb-primary">
              Explore Batches
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {filteredOrders.map((ord) => (
              <div className="col-12" key={ord._id}>
                <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom">
                    <div>
                      <span className="badge bg-light text-dark border me-2 small">
                        {ord.orderNumber}
                      </span>
                      <span className="text-muted small">
                        Placed on {new Date(ord.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <OrderStatusBadge status={ord.status} />
                  </div>

                  <div className="row g-4 align-items-center py-3">
                    <div className="col-md-5">
                      <div className="d-flex align-items-center gap-3">
                        {ord.business?.logoUrl ? (
                          <img
                            src={ord.business.logoUrl}
                            alt={ord.business.name}
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
                          <h6 className="fw-bold mb-0">{ord.business?.name}</h6>
                          <span className="text-muted small">
                            Batch: <strong>{ord.batch?.batchName || 'Artisan Batch'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="small text-muted mb-1">
                        <i className="bi bi-calendar-check text-success me-1"></i>
                        Prep Date:{' '}
                        <strong className="text-dark">
                          {ord.batch?.preparationDate
                            ? new Date(ord.batch.preparationDate).toLocaleDateString()
                            : 'Scheduled'}
                        </strong>
                      </div>
                      <div className="small text-muted">
                        <i className="bi bi-box-seam me-1"></i>
                        {ord.items?.length} {ord.items?.length === 1 ? 'item' : 'items'} &bull;{' '}
                        {ord.fulfillmentType}
                      </div>
                    </div>

                    <div className="col-md-3 text-md-end">
                      <div className="fs-5 fw-bold text-danger mb-2">
                        ₹{Number(ord.totalAmount).toFixed(2)}
                      </div>
                      <Link
                        to={`/customer/orders/${ord._id}`}
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                      >
                        Track / View Details <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
