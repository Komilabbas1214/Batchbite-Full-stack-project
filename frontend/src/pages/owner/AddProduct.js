import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Dish',
    basePrice: '',
    portionSize: '1 serving',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: '',
    isActive: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isNutFree: false,
    isHalal: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.basePrice === '') {
      toast.error('Product name and base price are required.');
      return;
    }

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

      const res = await api.post('/products', payload);
      if (res.data.success) {
        toast.success(`"${formData.name}" added to your menu!`);
        navigate('/owner/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title="Add New Dish to Catalog"
          subtitle="Create food items that can be scheduled into limited pre-order batches."
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
                <label className="form-label fw-semibold small">Product / Dish Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="e.g. Sourdough Loaf, Royal Dum Biryani, Croissant Pack"
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
                    placeholder="0.00"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                  />
                </div>
                <small className="text-muted">You can customize this price per batch later.</small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Portion / Package Sizing</label>
                <input
                  type="text"
                  className="form-control"
                  name="portionSize"
                  placeholder="e.g. 1 batard (approx 900g), Pack of 4, Serves 2-3"
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
                  placeholder="Describe flavors, fermentation process, textures, cooking methods..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">Photo Image URL</label>
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
                  placeholder="Organic Flour, French Butter, Cardamom, Sea Salt"
                  value={formData.ingredients}
                  onChange={handleChange}
                />
              </div>

              {/* Dietary Flags */}
              <div className="col-12">
                <label className="form-label fw-semibold small d-block">Dietary Attributes</label>
                <div className="d-flex flex-wrap gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbVeg"
                      name="isVegetarian"
                      checked={formData.isVegetarian}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbVeg">Vegetarian</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbVegan"
                      name="isVegan"
                      checked={formData.isVegan}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbVegan">Vegan</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbGluten"
                      name="isGlutenFree"
                      checked={formData.isGlutenFree}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbGluten">Gluten-Free</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbHalal"
                      name="isHalal"
                      checked={formData.isHalal}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbHalal">Halal</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cbNut"
                      name="isNutFree"
                      checked={formData.isNutFree}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cbNut">Nut-Free</label>
                  </div>
                </div>
              </div>

              <div className="col-12 mt-4 pt-3 border-top">
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-bb-primary px-4 py-2 fw-bold"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Save Product to Catalog'}
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

export default AddProduct;
