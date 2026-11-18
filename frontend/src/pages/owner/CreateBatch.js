import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerHeader from '../../components/owner/OwnerHeader';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const CreateBatch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [batchName, setBatchName] = useState('');
  const [description, setDescription] = useState('');
  const [preparationDate, setPreparationDate] = useState('');
  const [orderDeadline, setOrderDeadline] = useState('');
  const [pickupStartTime, setPickupStartTime] = useState('');
  const [pickupEndTime, setPickupEndTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Allocated items: array of { productId, price, maxQuantity, minOrderPerCustomer, maxOrderPerCustomer }
  const [batchItems, setBatchItems] = useState([]);

  useEffect(() => {
    const fetchOwnerProductsAndBusiness = async () => {
      try {
        const [prodRes, bizRes] = await Promise.all([
          api.get(`/products?businessId=${user?.business}&includeInactive=false`),
          api.get('/business/profile'),
        ]);

        if (prodRes.data.success) {
          setAvailableProducts(prodRes.data.products);
          // Pre-populate with first product if available
          if (prodRes.data.products.length > 0) {
            const first = prodRes.data.products[0];
            setBatchItems([
              {
                productId: first._id,
                price: first.basePrice,
                maxQuantity: 15,
                minOrderPerCustomer: 1,
                maxOrderPerCustomer: 4,
              },
            ]);
          }
        }

        if (bizRes.data.success && bizRes.data.business) {
          const b = bizRes.data.business;
          setPickupLocation(b.address ? `${b.address}, ${b.city}` : '');
          setPickupInstructions(b.pickupInstructions || '');
        }
      } catch (err) {
        console.error('Error fetching data for batch creation:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (user?.business) {
      fetchOwnerProductsAndBusiness();
    }
  }, [user]);

  const handleAddItemRow = () => {
    if (availableProducts.length === 0) return;
    const first = availableProducts[0];
    setBatchItems([
      ...batchItems,
      {
        productId: first._id,
        price: first.basePrice,
        maxQuantity: 10,
        minOrderPerCustomer: 1,
        maxOrderPerCustomer: 4,
      },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (batchItems.length <= 1) {
      toast.warning('A batch must contain at least one food item.');
      return;
    }
    setBatchItems(batchItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...batchItems];
    if (field === 'productId') {
      const prod = availableProducts.find((p) => p._id === value);
      updated[index].productId = value;
      if (prod) updated[index].price = prod.basePrice;
    } else {
      updated[index][field] = value;
    }
    setBatchItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!batchName || !preparationDate || !orderDeadline) {
      toast.error('Batch name, preparation date, and order deadline are required.');
      return;
    }

    if (new Date(orderDeadline) > new Date(preparationDate)) {
      toast.error('Order deadline must be before or on the preparation date.');
      return;
    }

    if (batchItems.length === 0) {
      toast.error('Please add at least one product to this batch.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        batchName,
        description,
        preparationDate,
        orderDeadline,
        pickupStartTime: pickupStartTime || null,
        pickupEndTime: pickupEndTime || null,
        pickupLocation,
        pickupInstructions,
        deliveryAvailable,
        deliveryFee: Number(deliveryFee) || 0,
        items: batchItems.map((item) => ({
          productId: item.productId,
          price: Number(item.price),
          maxQuantity: Number(item.maxQuantity),
          minOrderPerCustomer: Number(item.minOrderPerCustomer) || 1,
          maxOrderPerCustomer: Number(item.maxOrderPerCustomer) || 10,
        })),
      };

      const res = await api.post('/batches', payload);
      if (res.data.success) {
        toast.success(`Batch "${batchName}" created and published!`);
        navigate('/owner/batches');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create batch.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProducts) {
    return (
      <div className="bb-dashboard-layout">
        <OwnerSidebar />
        <div className="bb-dashboard-content">
          <Loader fullScreen message="Loading catalog and business details..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bb-dashboard-layout">
      <OwnerSidebar />

      <main className="bb-dashboard-content">
        <OwnerHeader
          title="Schedule A New Food Batch"
          subtitle="Define preparation timeline, pickup instructions, and product inventory limits."
          actions={
            <Link to="/owner/batches" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Batches
            </Link>
          }
        />

        {availableProducts.length === 0 ? (
          <div className="alert alert-warning rounded-4 p-4">
            <h5 className="fw-bold mb-2">No active food products found</h5>
            <p className="mb-3">
              Before scheduling a batch, you need to add at least one dish to your catalog.
            </p>
            <Link to="/owner/products/create" className="btn btn-bb-primary">
              <i className="bi bi-plus-circle me-1"></i> Add Dish to Catalog First
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Batch General Details */}
              <div className="col-lg-12">
                <div className="card p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white">
                  <h5 className="fw-bold mb-4">1. Batch Timeline & Information</h5>

                  <div className="row g-3 mb-4">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold small">Batch Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Saturday Hearth Sourdough Bake, Sunday Royal Biryani Feast"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Status</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value="OPEN (Accepting Pre-Orders)"
                        disabled
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Batch Announcement / Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Share details about this run: special seasonal ingredients, harvest notes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                        Preparation Date (Bake/Cooking Day) *
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={preparationDate}
                        onChange={(e) => setPreparationDate(e.target.value)}
                        required
                      />
                      <small className="text-muted">The date you will cook and package the food.</small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                        Order Deadline (Ordering Closes) *
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={orderDeadline}
                        onChange={(e) => setOrderDeadline(e.target.value)}
                        required
                      />
                      <small className="text-muted">
                        Must be prior to or on the prep date so you have time to source ingredients.
                      </small>
                    </div>
                  </div>

                  <h5 className="fw-bold mb-4 pt-3 border-top">2. Menu & Inventory Allocations</h5>
                  <p className="text-muted small mb-3">
                    Add the dishes you plan to prepare in this batch and set the maximum quantity you can comfortably cook.
                  </p>

                  <div className="table-responsive mb-3">
                    <table className="table align-middle">
                      <thead className="bg-light small text-muted">
                        <tr>
                          <th style={{ minWidth: '220px' }}>Dish / Product</th>
                          <th style={{ width: '130px' }}>Batch Price (₹)</th>
                          <th style={{ width: '130px' }}>Max Quantity</th>
                          <th style={{ width: '110px' }}>Min / Cust</th>
                          <th style={{ width: '110px' }}>Max / Cust</th>
                          <th style={{ width: '60px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <select
                                className="form-select"
                                value={item.productId}
                                onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                              >
                                {availableProducts.map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.name} (₹{Number(p.basePrice).toFixed(2)})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-control"
                                value={item.price}
                                onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                value={item.maxQuantity}
                                onChange={(e) => handleItemChange(idx, 'maxQuantity', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                value={item.minOrderPerCustomer}
                                onChange={(e) => handleItemChange(idx, 'minOrderPerCustomer', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                value={item.maxOrderPerCustomer}
                                onChange={(e) => handleItemChange(idx, 'maxOrderPerCustomer', e.target.value)}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleRemoveItemRow(idx)}
                                title="Remove Dish from Batch"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mb-4"
                    onClick={handleAddItemRow}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add Another Dish to Menu
                  </button>

                  <h5 className="fw-bold mb-4 pt-3 border-top">3. Pickup & Delivery Settings</h5>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Pickup Window Start</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={pickupStartTime}
                        onChange={(e) => setPickupStartTime(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Pickup Window End</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={pickupEndTime}
                        onChange={(e) => setPickupEndTime(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Pickup Location Address</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Porch pickup address..."
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Specific Pickup Instructions</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Ring side bell, thermal bags on porch table marked with your order number..."
                        value={pickupInstructions}
                        onChange={(e) => setPickupInstructions(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <div className="form-check form-switch mt-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="deliverySwitch"
                          checked={deliveryAvailable}
                          onChange={(e) => setDeliveryAvailable(e.target.checked)}
                        />
                        <label className="form-check-label fw-bold" htmlFor="deliverySwitch">
                          Offer Doorstep Local Delivery
                        </label>
                      </div>
                    </div>

                    {deliveryAvailable && (
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Delivery Fee (₹ INR)</label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-top d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-bb-primary px-5 py-3 fw-bold shadow-sm"
                      disabled={submitting}
                    >
                      {submitting ? 'Creating Batch...' : 'Publish Batch & Open Pre-Orders'}
                    </button>
                    <Link to="/owner/batches" className="btn btn-outline-secondary px-4 py-3">
                      Cancel
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default CreateBatch;
