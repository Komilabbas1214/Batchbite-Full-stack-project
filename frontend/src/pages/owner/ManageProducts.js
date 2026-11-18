import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import { DietaryBadges } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ManageProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products?businessId=${user?.business}&includeInactive=true`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.business) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate "${productName}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data.success) {
        toast.info(res.data.message || 'Product updated.');
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const res = await api.put(`/products/${product._id}`, {
        isActive: !product.isActive,
      });
      if (res.data.success) {
        toast.success(
          `"${product.name}" is now ${!product.isActive ? 'Active' : 'Inactive'}`
        );
        fetchProducts();
      }
    } catch (err) {
      toast.error('Failed to update product status.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title="Food Product Catalog"
          subtitle="Manage your kitchen dishes, base prices, dietary attributes, and availability."
          actions={
            <Link to="/owner/products/create" className="btn btn-bb-primary btn-sm">
              <i className="bi bi-plus-circle me-1"></i> Add New Product
            </Link>
          }
        />

        {/* Filter Bar */}
        <div className="card p-3 border-0 shadow-sm rounded-4 bg-white mb-4">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search products by title or ingredients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Main Dish">Main Dish</option>
                <option value="Bakery & Pastry">Bakery & Pastry</option>
                <option value="Desserts">Desserts</option>
                <option value="Snacks & Appetizers">Snacks & Appetizers</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Catalog List */}
        {loading ? (
          <Loader message="Loading kitchen products..." />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-4 border shadow-sm">
            <i className="bi bi-egg-fried display-4 text-muted opacity-50 mb-3 d-block"></i>
            <h4 className="fw-bold">No products found</h4>
            <p className="text-muted max-w-500 mx-auto mb-3">
              Add your signature recipes, baked goods, or family dinner portions to start including them in batch schedules.
            </p>
            <Link to="/owner/products/create" className="btn btn-bb-primary">
              <i className="bi bi-plus-circle me-1"></i> Add Your First Dish
            </Link>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="bg-light small text-muted">
                  <tr>
                    <th className="ps-4">Product Details</th>
                    <th>Category</th>
                    <th>Base Price</th>
                    <th>Dietary Flags</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="rounded-3 border"
                            style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                          />
                          <div>
                            <strong className="d-block text-dark">{p.name}</strong>
                            <small className="text-muted">
                              Portion: {p.portionSize || '1 portion'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {p.category}
                        </span>
                      </td>
                      <td className="fw-bold fs-6">
                        ₹{Number(p.basePrice).toFixed(2)}
                      </td>
                      <td>
                        <DietaryBadges dietaryFlags={p.dietaryFlags} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 ${
                            p.isActive
                              ? 'btn-outline-success'
                              : 'btn-outline-secondary'
                          }`}
                          onClick={() => handleToggleActive(p)}
                          title="Click to toggle active status"
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex gap-2">
                          <Link
                            to={`/owner/products/edit/${p._id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="Edit Product"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(p._id, p.name)}
                            title="Delete / Deactivate"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
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

export default ManageProducts;
