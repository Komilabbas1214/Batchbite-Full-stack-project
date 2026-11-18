import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Dish',
    basePrice: '',
    portionSize: '',
    imageUrl: '',
    ingredients: '',
    isActive: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isNutFree: false,
    isHalal: false,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success && res.data.product) {
          const p = res.data.product;
          setFormData({
            name: p.name || '',
            description: p.description || '',
            category: p.category || 'Main Dish',
            basePrice: p.basePrice || 0,
            portionSize: p.portionSize || '',
            imageUrl: p.imageUrl || '',
            ingredients: Array.isArray(p.ingredients) ? p.ingredients.join(', ') : '',
            isActive: p.isActive ?? true,
            isVegetarian: p.dietaryFlags?.isVegetarian || false,
            isVegan: p.dietaryFlags?.isVegan || false,
            isGlutenFree: p.dietaryFlags?.isGlutenFree || false,
            isNutFree: p.dietaryFlags?.isNutFree || false,
            isHalal: p.dietaryFlags?.isHalal || false,
          });
        }
      } catch (err) {
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        basePrice: Number(formData.basePrice),
        portionSize: formData.portionSize,
        imageUrl: formData.imageUrl,
        ingredients: formData.ingredients,
        isActive: formData.isActive,
        dietaryFlags: {
          isVegetarian: formData.isVegetarian,
          isVegan: formData.isVegan,
          isGlutenFree: formData.isGlutenFree,
          isNutFree: formData.isNutFree,
          isHalal: formData.isHalal,
        },
      };

      const res = await api.put(`/products/${id}`, payload);
      if (res.data.success) {
        toast.success(`"${formData.name}" updated successfully!`);
        navigate('/owner/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <Loader fullScreen message="Loading dish data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title={`Edit: ${formData.name}`}
          subtitle="Update product description, pricing, or dietary specifications."
          actions={
            <Link to="/owner/products" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Catalog
            </Link>
          }
        />

        <div className="card p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white max-w-900">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label fw-semibold small">Product Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold small">Category *</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Main Dish">Main Dish</option>
                  <option value="Bakery & Pastry">Bakery & Pastry</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Snacks & Appetizers">Snacks & Appetizers</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Preserves & Sauces">Preserves & Sauces</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Base Price (₹ INR) *</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Portion / Packaging</label>
                <input
                  type="text"
                  className="form-control"
                  name="portionSize"
                  value={formData.portionSize}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">
                  Ingredients (Comma-separated)
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small d-block">Dietary Attributes</label>
                <div className="d-flex flex-wrap gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbVegEdit"
                      name="isVegetarian"
                      checked={formData.isVegetarian}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbVegEdit">Vegetarian</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbVeganEdit"
                      name="isVegan"
                      checked={formData.isVegan}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbVeganEdit">Vegan</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbGlutenEdit"
                      name="isGlutenFree"
                      checked={formData.isGlutenFree}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbGlutenEdit">Gluten-Free</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbHalalEdit"
                      name="isHalal"
                      checked={formData.isHalal}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbHalalEdit">Halal</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbNutEdit"
                      name="isNutFree"
                      checked={formData.isNutFree}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbNutEdit">Nut-Free</label>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isActiveEdit"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fw-bold" htmlFor="isActiveEdit">
                    Dish is Active and Available for Batches
                  </label>
                </div>
              </div>

              <div className="col-12 mt-4 pt-3 border-top">
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-bb-primary px-4 py-2 fw-bold"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving Changes...' : 'Update Dish'}
                  </button>
                  <Link to="/owner/products" className="btn btn-outline-secondary px-3 py-2">
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProduct;
