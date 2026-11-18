import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const BusinessProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    cuisineType: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pickupInstructions: '',
    logoUrl: '',
    bannerUrl: '',
    isOpenForOrders: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/business/profile');
        if (res.data.success && res.data.business) {
          const b = res.data.business;
          setFormData({
            name: b.name || '',
            tagline: b.tagline || '',
            description: b.description || '',
            cuisineType: b.cuisineType || 'Bakery & Pastry',
            email: b.email || '',
            phone: b.phone || '',
            address: b.address || '',
            city: b.city || '',
            pickupInstructions: b.pickupInstructions || '',
            logoUrl: b.logoUrl || '',
            bannerUrl: b.bannerUrl || '',
            isOpenForOrders: b.isOpenForOrders ?? true,
          });
        }
      } catch (err) {
        toast.error('Failed to load business profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put('/business/profile', formData);
      if (res.data.success) {
        toast.success('Business profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <Loader fullScreen message="Loading kitchen profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title="Kitchen Profile & Settings"
          subtitle="Configure your brand details, pickup instructions, and ordering availability."
        />

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left Column: Core Info */}
            <div className="col-lg-8">
              <div className="card p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white mb-4">
                <h5 className="fw-bold mb-4">Branding & Overview</h5>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Kitchen / Brand Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Tagline</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tagline"
                      placeholder="e.g. Artisanal Sourdough & French Pastries"
                      value={formData.tagline}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Cuisine / Food Focus</label>
                    <select
                      className="form-select"
                      name="cuisineType"
                      value={formData.cuisineType}
                      onChange={handleChange}
                    >
                      <option value="Bakery & Pastry">Bakery & Pastry</option>
                      <option value="Main Dish">Main Dish / Family Dinners</option>
                      <option value="Desserts & Sweets">Desserts & Sweets</option>
                      <option value="Snacks & Appetizers">Snacks & Appetizers</option>
                      <option value="Preserves & Specialty">Preserves & Specialty</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">About Your Kitchen</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    name="description"
                    placeholder="Tell your customers about your fermentation, organic ingredients, family heritage..."
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <h5 className="fw-bold mb-4 pt-3 border-top">Location & Porch Pickup</h5>

                <div className="row g-3 mb-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small">Address / Pickup Area</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      placeholder="e.g. 142 Orchard Lane, Baker District"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">City / Town</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      placeholder="e.g. Portland"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Detailed Pickup Instructions *
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="pickupInstructions"
                    placeholder="Where should customers go? e.g. Side porch table, ring doorbell, bags marked with order numbers..."
                    value={formData.pickupInstructions}
                    onChange={handleChange}
                  ></textarea>
                  <small className="text-muted">
                    This will be provided to customers in their order confirmation and tracking screens.
                  </small>
                </div>
              </div>
            </div>

            {/* Right Column: Status & Media */}
            <div className="col-lg-4">
              {/* Order Status Toggle Card */}
              <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
                <h5 className="fw-bold mb-3">Kitchen Availability</h5>
                <div className="form-check form-switch fs-5 mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isOpenSwitch"
                    name="isOpenForOrders"
                    checked={formData.isOpenForOrders}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fs-6 fw-bold" htmlFor="isOpenSwitch">
                    {formData.isOpenForOrders ? 'Open for Orders' : 'Kitchen Temporarily Closed'}
                  </label>
                </div>
                <small className="text-muted">
                  Toggle off if you are traveling or taking a break. Batches will be hidden from new pre-orders.
                </small>
              </div>

              {/* Contact Details Card */}
              <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
                <h5 className="fw-bold mb-3">Contact Channels</h5>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Kitchen Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Public Phone / SMS</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Visual Media URLs */}
              <div className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
                <h5 className="fw-bold mb-3">Imagery</h5>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Logo / Chef Avatar URL</label>
                  <input
                    type="url"
                    className="form-control"
                    name="logoUrl"
                    placeholder="https://..."
                    value={formData.logoUrl}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Banner Photo URL</label>
                  <input
                    type="url"
                    className="form-control"
                    name="bannerUrl"
                    placeholder="https://..."
                    value={formData.bannerUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-bb-primary w-100 py-3 fw-bold shadow-sm"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving Profile...
                  </>
                ) : (
                  'Save Profile Settings'
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default BusinessProfile;
