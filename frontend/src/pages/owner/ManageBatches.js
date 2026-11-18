import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import { BatchStatusBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ManageBatches = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBatches = async () => {
    try {
      const res = await api.get(`/batches?businessId=${user?.business}&all=true`);
      if (res.data.success) {
        setBatches(res.data.batches);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.business) {
      fetchBatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleQuickStatusChange = async (batchId, newStatus) => {
    try {
      const res = await api.patch(`/batches/${batchId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Batch status changed to ${newStatus}`);
        fetchBatches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update batch status.');
    }
  };

  const filteredBatches = batches.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title="Manage Food Batches"
          subtitle="Schedule limited preparation runs, define order deadlines, and allocate product capacities."
          actions={
            <Link to="/owner/batches/create" className="btn btn-bb-primary btn-sm">
              <i className="bi bi-calendar-plus me-1"></i> Create New Batch
            </Link>
          }
        />

        {/* Status Filters */}
        <div className="d-flex gap-2 mb-4 border-bottom pb-3 flex-wrap">
          {['ALL', 'OPEN', 'PREPARING', 'READY', 'COMPLETED', 'CLOSED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-3 fw-medium ${
                statusFilter === tab
                  ? 'btn-danger'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab === 'ALL' ? 'All Batches' : tab}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader message="Loading batches..." />
        ) : filteredBatches.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-4 border shadow-sm">
            <i className="bi bi-calendar2-range display-4 text-muted opacity-50 mb-3 d-block"></i>
            <h4 className="fw-bold">No batches in this view</h4>
            <p className="text-muted max-w-500 mx-auto mb-4">
              Schedule a new batch with a preparation date and order deadline to begin receiving customer pre-orders.
            </p>
            <Link to="/owner/batches/create" className="btn btn-bb-primary">
              <i className="bi bi-calendar-plus me-1"></i> Schedule First Batch
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {filteredBatches.map((b) => {
              const prepDate = new Date(b.preparationDate);
              const deadline = new Date(b.orderDeadline);
              const totalItemsCount = b.items?.length || 0;
              const totalCapacity = b.items?.reduce((acc, i) => acc + (i.maxQuantity || 0), 0) || 0;
              const totalOrdered = b.items?.reduce((acc, i) => acc + (i.orderedQuantity || 0), 0) || 0;
              const percentBooked = totalCapacity > 0 ? Math.round((totalOrdered / totalCapacity) * 100) : 0;

              return (
                <div className="col-12" key={b._id}>
                  <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom">
                      <div>
                        <h5 className="fw-bold mb-1 text-dark">
                          <Link to={`/owner/batches/${b._id}`} className="text-dark text-decoration-none">
                            {b.batchName}
                          </Link>
                        </h5>
                        <small className="text-muted">
                          {totalItemsCount} {totalItemsCount === 1 ? 'Dish' : 'Dishes'} in Menu &bull;{' '}
                          {b.deliveryAvailable ? 'Pickup & Delivery' : 'Pickup Only'}
                        </small>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <BatchStatusBadge status={b.status} />

                        {/* Quick Status Dropdown */}
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            Update Status
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                            <li>
                              <button
                                className="dropdown-item small"
                                onClick={() => handleQuickStatusChange(b._id, 'OPEN')}
                              >
                                <span className="badge bg-success me-2">&bull;</span> Set OPEN
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item small"
                                onClick={() => handleQuickStatusChange(b._id, 'CLOSED')}
                              >
                                <span className="badge bg-secondary me-2">&bull;</span> Close Orders
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item small"
                                onClick={() => handleQuickStatusChange(b._id, 'PREPARING')}
                              >
                                <span className="badge bg-warning me-2">&bull;</span> In Kitchen Prep
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item small"
                                onClick={() => handleQuickStatusChange(b._id, 'READY')}
                              >
                                <span className="badge bg-info me-2">&bull;</span> Ready for Pickup
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item small"
                                onClick={() => handleQuickStatusChange(b._id, 'COMPLETED')}
                              >
                                <span className="badge bg-dark me-2">&bull;</span> Mark Completed
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="row g-4 align-items-center py-3">
                      <div className="col-md-4">
                        <div className="small text-muted mb-1">
                          <i className="bi bi-calendar-check text-success me-1"></i>
                          Preparation Date:
                        </div>
                        <strong className="text-dark">
                          {prepDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </strong>
                      </div>

                      <div className="col-md-4">
                        <div className="small text-muted mb-1">
                          <i className="bi bi-clock-history text-danger me-1"></i>
                          Order Deadline:
                        </div>
                        <strong className="text-dark">
                          {deadline.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </div>

                      <div className="col-md-4">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Capacity Booked:</span>
                          <strong className="text-dark">{totalOrdered} / {totalCapacity} ({percentBooked}%)</strong>
                        </div>
                        <div className="progress" style={{ height: '7px' }}>
                          <div
                            className={`progress-bar ${
                              percentBooked >= 90 ? 'bg-danger' : percentBooked >= 50 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${percentBooked}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                      <Link
                        to={`/batches/${b._id}`}
                        target="_blank"
                        className="btn btn-sm btn-outline-secondary"
                        title="View Customer Page"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i> View Storefront
                      </Link>
                      <Link
                        to={`/owner/batches/${b._id}`}
                        className="btn btn-sm btn-bb-primary"
                      >
                        Manage Batch & Capacity <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageBatches;
