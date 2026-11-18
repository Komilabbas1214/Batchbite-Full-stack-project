import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { OrderStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Error fetching dashboard orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const activeOrders = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  // Next scheduled pickup
  const nextOrder = activeOrders.sort(
    (a, b) => new Date(a.batch?.preparationDate) - new Date(b.batch?.preparationDate)
  )[0];

  return (
    <div className="py-5">
      <div className="container">
        {/* Welcome Banner */}
        <div className="p-4 p-md-5 rounded-4 bg-white border-0 shadow-sm mb-4">
          <div className="row align-items-center g-3">
            <div className="col-md-8">
              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 mb-2">
                Customer Hub
              </span>
              <h1 className="fw-extrabold mb-1">Hello, {user?.name}!</h1>
              <p className="text-muted mb-0">
                Manage your active batch pre-orders and explore fresh weekend bakes in your neighborhood.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <Link to="/batches" className="btn btn-bb-primary">
                <i className="bi bi-compass me-2"></i> Browse Batches
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Active Pre-Orders</span>
                <h2 className="fw-extrabold mb-0 text-dark mt-1">{activeOrders.length}</h2>
              </div>
              <div className="bb-stat-icon bg-warning bg-opacity-10 text-dark">
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Completed Bakes</span>
                <h2 className="fw-extrabold mb-0 text-dark mt-1">{completedOrders.length}</h2>
              </div>
              <div className="bb-stat-icon bg-success bg-opacity-10 text-success">
                <i className="bi bi-check2-circle"></i>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Total Lifetime Orders</span>
                <h2 className="fw-extrabold mb-0 text-dark mt-1">{orders.length}</h2>
              </div>
              <div className="bb-stat-icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-receipt"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Next Scheduled Pickup Banner if active */}
        {nextOrder && (
          <div className="card p-4 rounded-4 border-0 shadow-sm bg-danger text-white mb-4">
            <div className="row align-items-center g-3">
              <div className="col-md-8">
                <span className="badge bg-white text-danger fw-bold mb-2">
                  Next Scheduled Pickup
                </span>
                <h4 className="fw-bold mb-1 text-white">{nextOrder.batch?.batchName}</h4>
                <p className="mb-0 text-white-50 small">
                  Kitchen: <strong>{nextOrder.business?.name}</strong> &bull; Scheduled Date:{' '}
                  {nextOrder.batch?.preparationDate
                    ? new Date(nextOrder.batch.preparationDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Scheduled'}
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <Link
                  to={`/customer/orders/${nextOrder._id}`}
                  className="btn btn-light text-danger fw-bold btn-sm rounded-pill px-4"
                >
                  View Order Status <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders List */}
        <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Recent Pre-Orders</h5>
            <Link to="/customer/orders" className="btn btn-outline-secondary btn-sm">
              View All Orders
            </Link>
          </div>

          {loading ? (
            <Loader message="Loading orders..." />
          ) : orders.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bag-plus fs-2 mb-2 d-block opacity-50"></i>
              <p>You haven't placed any pre-orders yet.</p>
              <Link to="/batches" className="btn btn-bb-primary btn-sm">
                Explore Available Batches
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="bg-light small text-muted">
                  <tr>
                    <th>Order #</th>
                    <th>Kitchen</th>
                    <th>Batch Name</th>
                    <th>Prep Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord._id}>
                      <td className="fw-bold">{ord.orderNumber}</td>
                      <td>{ord.business?.name}</td>
                      <td>{ord.batch?.batchName}</td>
                      <td className="small text-muted">
                        {ord.batch?.preparationDate
                          ? new Date(ord.batch.preparationDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="fw-bold">₹{Number(ord.totalAmount).toFixed(2)}</td>
                      <td>
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td>
                        <Link
                          to={`/customer/orders/${ord._id}`}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
