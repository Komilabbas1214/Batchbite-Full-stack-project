import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import { OrderStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/business/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching owner dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <Loader fullScreen message="Loading kitchen dashboard metrics..." />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
    totalConfirmedSales: 0,
    activeBatches: 0,
    totalProducts: 0,
  };

  const remainingInventory = data?.remainingInventory || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title="Kitchen Management Dashboard"
          subtitle="Real-time sales statistics, pre-order queues, and batch capacity monitoring."
          actions={
            <>
              <Link to="/owner/batches/create" className="btn btn-bb-primary btn-sm">
                <i className="bi bi-calendar-plus me-1"></i> New Batch
              </Link>
              <Link to="/owner/products/create" className="btn btn-bb-outline btn-sm">
                <i className="bi bi-plus-circle me-1"></i> Add Product
              </Link>
            </>
          }
        />

        {/* 6 Key Performance Metric Cards */}
        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Total Sales</span>
                <h3 className="fw-extrabold text-danger mt-1 mb-0">
                  ₹{Number(stats.totalConfirmedSales).toFixed(2)}
                </h3>
                <small className="text-muted">Confirmed orders revenue</small>
              </div>
              <div className="bb-stat-icon bg-danger bg-opacity-10 text-danger">
                <i className="bi bi-cash-stack"></i>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Pending Orders</span>
                <h3 className="fw-extrabold text-warning mt-1 mb-0">{stats.pendingOrders}</h3>
                <small className="text-muted">Awaiting confirmation</small>
              </div>
              <div className="bb-stat-icon bg-warning bg-opacity-10 text-dark">
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Active Batches</span>
                <h3 className="fw-extrabold text-primary mt-1 mb-0">{stats.activeBatches}</h3>
                <small className="text-muted">Open / In progress</small>
              </div>
              <div className="bb-stat-icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-calendar-event"></i>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Total Orders</span>
                <h3 className="fw-extrabold text-dark mt-1 mb-0">{stats.totalOrders}</h3>
                <small className="text-muted">All-time customer orders</small>
              </div>
              <div className="bb-stat-icon bg-success bg-opacity-10 text-success">
                <i className="bi bi-receipt"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Row: Remaining Inventory & Order Status Overview */}
        <div className="row g-4 mb-4">
          {/* Active Batch Remaining Inventory Monitor */}
          <div className="col-lg-7">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Active Batch Inventory Levels</h5>
                <Link to="/owner/batches" className="btn btn-outline-secondary btn-sm">
                  View All Batches
                </Link>
              </div>
              <p className="text-muted small">
                Monitor booked vs remaining portions in active batches to prevent kitchen overload.
              </p>

              {remainingInventory.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar2-x fs-2 opacity-50 mb-2 d-block"></i>
                  No active batches with products.
                  <div className="mt-2">
                    <Link to="/owner/batches/create" className="btn btn-bb-primary btn-sm">
                      Create Batch
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {remainingInventory.slice(0, 5).map((inv, idx) => {
                    const percentage = Math.round(
                      (inv.orderedQuantity / inv.maxQuantity) * 100
                    );
                    return (
                      <div key={idx} className="p-3 bg-light rounded-3 border">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div>
                            <strong className="text-dark">{inv.productName}</strong>
                            <small className="text-muted d-block">
                              Batch: {inv.batchName} &bull; Prep:{' '}
                              {new Date(inv.preparationDate).toLocaleDateString()}
                            </small>
                          </div>
                          <span className="badge bg-white text-dark border fw-bold">
                            {inv.orderedQuantity} / {inv.maxQuantity} Sold
                          </span>
                        </div>
                        <div className="progress mt-2" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar ${
                              percentage >= 90 ? 'bg-danger' : percentage >= 50 ? 'bg-warning' : 'bg-success'
                            }`}
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between text-muted small mt-1">
                          <span>{inv.availableQuantity} portions available</span>
                          <span>{percentage}% booked</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts & Kitchen Status */}
          <div className="col-lg-5">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
              <h5 className="fw-bold mb-3">Order Status Distribution</h5>
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                  <span>
                    <i className="bi bi-clock-history text-warning me-2"></i> Pending Confirmation
                  </span>
                  <span className="badge bg-warning text-dark rounded-pill">
                    {stats.pendingOrders}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                  <span>
                    <i className="bi bi-check2-circle text-info me-2"></i> Confirmed
                  </span>
                  <span className="badge bg-info text-white rounded-pill">
                    {stats.confirmedOrders}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                  <span>
                    <i className="bi bi-fire text-primary me-2"></i> In Kitchen / Baking
                  </span>
                  <span className="badge bg-primary rounded-pill">
                    {stats.preparingOrders || 0}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                  <span>
                    <i className="bi bi-trophy text-success me-2"></i> Completed
                  </span>
                  <span className="badge bg-success rounded-pill">
                    {stats.completedOrders}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                  <span>
                    <i className="bi bi-x-circle text-secondary me-2"></i> Cancelled / Declined
                  </span>
                  <span className="badge bg-secondary rounded-pill">
                    {(stats.cancelledOrders || 0) + (stats.rejectedOrders || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
              <h5 className="fw-bold mb-3">Owner Shortcuts</h5>
              <div className="d-grid gap-2">
                <Link to="/owner/batches/create" className="btn btn-outline-danger text-start">
                  <i className="bi bi-plus-circle me-2"></i> Schedule A New Food Batch
                </Link>
                <Link to="/owner/products/create" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-egg-fried me-2"></i> Add Food Item to Menu
                </Link>
                <Link to="/owner/reports/sales" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-graph-up me-2"></i> Detailed Sales & Revenue Report
                </Link>
                <Link to="/owner/business-profile" className="btn btn-outline-secondary text-start">
                  <i className="bi bi-shop me-2"></i> Update Porch Pickup Instructions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Queue */}
        <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">Recent Customer Orders</h5>
              <small className="text-muted">Orders placed for your kitchen</small>
            </div>
            <Link to="/owner/orders" className="btn btn-bb-primary btn-sm">
              Manage All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No orders received yet. Once customers pre-order from your batches, they will appear here.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="bg-light small text-muted">
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Batch</th>
                    <th>Prep Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td className="fw-bold">{ord.orderNumber}</td>
                      <td>
                        <strong>{ord.customer?.name || 'Customer'}</strong>
                        <small className="text-muted d-block">{ord.customer?.phone}</small>
                      </td>
                      <td>{ord.batch?.batchName}</td>
                      <td className="small text-muted">
                        {ord.batch?.preparationDate
                          ? new Date(ord.batch.preparationDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>{ord.items?.length || 0}</td>
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

export default OwnerDashboard;
