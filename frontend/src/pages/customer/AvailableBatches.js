import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BatchCard from '../../components/customer/BatchCard';
import Loader from '../../components/common/Loader';

const AvailableBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('All');

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search.trim()) queryParams.append('search', search.trim());

        const res = await api.get(`/batches?${queryParams.toString()}`);
        if (res.data.success) {
          setBatches(res.data.batches);
        }
      } catch (err) {
        console.error('Error fetching batches:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBatches();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Extract unique cities
  const cities = ['All', ...new Set(batches.map((b) => b.business?.city).filter(Boolean))];

  const filteredBatches = batches.filter((b) => {
    if (filterCity !== 'All' && b.business?.city !== filterCity) {
      return false;
    }
    return true;
  });

  return (
    <div className="py-5">
      <div className="container">
        {/* Page Title */}
        <div className="text-center max-w-700 mx-auto mb-5">
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-pill fw-semibold mb-2">
            Seasonal & Artisanal
          </span>
          <h1 className="fw-extrabold display-5">Available Batches</h1>
          <p className="lead text-muted">
            Explore freshly announced food batches available for pre-order. Remember: once the order deadline closes, the chef bakes only what was reserved!
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="card p-3 border-0 shadow-sm rounded-4 bg-white mb-5">
          <div className="row g-3 align-items-center">
            <div className="col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by batch name, description, or kitchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearch('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-5">
              <div className="d-flex align-items-center gap-2">
                <label className="fw-semibold small text-muted text-nowrap">Filter Location:</label>
                <select
                  className="form-select"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Locations' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loader message="Fetching available batches..." />
        ) : filteredBatches.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-4 border shadow-sm">
            <span className="fs-1">🔍</span>
            <h4 className="fw-bold mt-3">No matching batches found</h4>
            <p className="text-muted">
              {search || filterCity !== 'All'
                ? 'Try tweaking your search term or selecting "All Locations".'
                : 'There are currently no active batches open for pre-orders.'}
            </p>
            {(search || filterCity !== 'All') && (
              <button
                className="btn btn-bb-outline btn-sm"
                onClick={() => {
                  setSearch('');
                  setFilterCity('All');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted small">
                Showing <strong>{filteredBatches.length}</strong> open{' '}
                {filteredBatches.length === 1 ? 'batch' : 'batches'}
              </span>
            </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {filteredBatches.map((batch) => (
                <div className="col" key={batch._id}>
                  <BatchCard batch={batch} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AvailableBatches;
