import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import Loader from '../../components/common/Loader';

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/business/reports/sales');
        if (res.data.success) {
          setReport(res.data.report);
        }
      } catch (err) {
        console.error('Error fetching sales report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <Loader fullScreen message="Compiling sales & revenue analytics..." />
        </div>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    totalOrdersCount = 0,
    totalItemsSold = 0,
    productSales = [],
    batchSales = [],
    orders = [],
  } = report || {};

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title="Sales & Revenue Report"
          subtitle="Comprehensive revenue breakdown by dish, batch performance, and order history."
          actions={
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-1"></i> Print / Export Report
            </button>
          }
        />

        {/* 3 Main Stat Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Total Sales Revenue</span>
                <h2 className="fw-extrabold text-danger mt-1 mb-0">₹{Number(totalRevenue).toFixed(2)}</h2>
                <small className="text-muted">From confirmed & fulfilled batches</small>
              </div>
              <div className="bb-stat-icon bg-danger bg-opacity-10 text-danger">
                <i className="bi bi-currency-rupee"></i>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Confirmed Orders</span>
                <h2 className="fw-extrabold text-dark mt-1 mb-0">{totalOrdersCount}</h2>
                <small className="text-muted">Excludes cancelled/declined</small>
              </div>
              <div className="bb-stat-icon bg-success bg-opacity-10 text-success">
                <i className="bi bi-receipt-cutoff"></i>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bb-stat-card">
              <div>
                <span className="text-muted small fw-bold text-uppercase">Food Portions Sold</span>
                <h2 className="fw-extrabold text-primary mt-1 mb-0">{totalItemsSold}</h2>
                <small className="text-muted">Individual meals & bakes baked</small>
              </div>
              <div className="bb-stat-icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-egg-fried"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Tables */}
        <div className="row g-4 mb-4">
          {/* Product Sales Ranking */}
          <div className="col-lg-6">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white h-100">
              <h5 className="fw-bold mb-3">Top Selling Dishes by Revenue</h5>
              {productSales.length === 0 ? (
                <p className="text-muted py-3">No product sales recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="bg-light small text-muted">
                      <tr>
                        <th>Dish Name</th>
                        <th className="text-center">Portions Sold</th>
                        <th className="text-end">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productSales.map((ps, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold text-dark">{ps.productName}</td>
                          <td className="text-center">{ps.quantitySold}</td>
                          <td className="text-end fw-bold text-danger">
                            ₹{Number(ps.revenue).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Batch Sales Ranking */}
          <div className="col-lg-6">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white h-100">
              <h5 className="fw-bold mb-3">Revenue by Batch Run</h5>
              {batchSales.length === 0 ? (
                <p className="text-muted py-3">No batch sales recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="bg-light small text-muted">
                      <tr>
                        <th>Batch Name</th>
                        <th className="text-center">Orders</th>
                        <th className="text-end">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchSales.map((bs, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold text-dark">{bs.batchName}</td>
                          <td className="text-center">{bs.orderCount}</td>
                          <td className="text-end fw-bold text-danger">
                            ₹{Number(bs.revenue).toFixed(2)}
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

        {/* Detailed Transactions List */}
        <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
          <h5 className="fw-bold mb-3">Confirmed Sales Transactions</h5>
          {orders.length === 0 ? (
            <p className="text-muted py-3">No sales transactions available.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="bg-light small text-muted">
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Batch</th>
                    <th className="text-end">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td className="fw-bold">{ord.orderNumber}</td>
                      <td className="small text-muted">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td>{ord.customer?.name}</td>
                      <td className="small">{ord.batch?.batchName}</td>
                      <td className="text-end fw-bold text-danger">
                        ₹{Number(ord.totalAmount).toFixed(2)}
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

export default SalesReport;
