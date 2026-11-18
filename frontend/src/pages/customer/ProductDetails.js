import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { DietaryBadges } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductAndBatches = async () => {
      try {
        const pRes = await api.get(`/products/${id}`);
        if (pRes.data.success) {
          setProduct(pRes.data.product);

          // Fetch upcoming batches from this business
          const bRes = await api.get(`/batches?businessId=${pRes.data.product.business._id}`);
          if (bRes.data.success) {
            setBatches(bRes.data.batches);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndBatches();
  }, [id]);

  if (loading) {
    return <Loader fullScreen message="Loading dish profile..." />;
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger py-4">
          <h5>{error || 'Product not found'}</h5>
          <Link to="/batches" className="btn btn-outline-danger mt-3">
            Browse Batches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/batches">Batches</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="card p-4 p-lg-5 border-0 shadow-sm rounded-4 bg-white mb-5">
          <div className="row g-5 align-items-center">
            {/* Product Image */}
            <div className="col-lg-6">
              <div className="position-relative overflow-hidden rounded-4 shadow-sm">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="img-fluid w-100"
                  style={{ maxHeight: '450px', objectFit: 'cover' }}
                />
                <span className="badge bg-dark bg-opacity-75 text-white position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="col-lg-6">
              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <h2 className="fw-extrabold mb-0">{product.name}</h2>
                <span className="display-6 fw-bold text-danger">
                  ₹{Number(product.basePrice).toFixed(2)}
                </span>
              </div>

              {product.portionSize && (
                <div className="text-muted mb-3">
                  <i className="bi bi-pie-chart me-1 text-danger"></i>
                  <strong>Portion Size:</strong> {product.portionSize}
                </div>
              )}

              <p className="lead text-secondary mb-4">{product.description}</p>

              {/* Dietary flags */}
              {product.dietaryFlags && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2 small text-uppercase text-muted">Dietary Preferences:</h6>
                  <DietaryBadges dietaryFlags={product.dietaryFlags} />
                </div>
              )}

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2 small text-uppercase text-muted">Ingredients Used:</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {product.ingredients.map((ing, idx) => (
                      <span key={idx} className="badge bg-light text-dark border px-2 py-1">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Kitchen Card */}
              <div className="p-3 bg-light rounded-3 border mt-4">
                <div className="d-flex align-items-center gap-3">
                  {product.business?.logoUrl ? (
                    <img
                      src={product.business.logoUrl}
                      alt={product.business.name}
                      className="rounded-circle border"
                      style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center"
                      style={{ width: '42px', height: '42px' }}
                    >
                      🍳
                    </div>
                  )}
                  <div>
                    <h6 className="mb-0 fw-bold">{product.business?.name}</h6>
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i>
                      {product.business?.city || 'Artisan Kitchen'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Batches featuring this item */}
        <div className="mt-5">
          <h3 className="fw-bold mb-3">Upcoming Batches Featuring This Dish</h3>
          {batches.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {batches.map((b) => (
                <div className="col" key={b._id}>
                  <div className="card h-100 p-4 border-0 shadow-sm rounded-4 bg-white">
                    <h5 className="fw-bold mb-2">{b.batchName}</h5>
                    <p className="small text-muted mb-3">
                      Prep Date: {new Date(b.preparationDate).toLocaleDateString()}
                    </p>
                    <Link to={`/batches/${b._id}`} className="btn btn-bb-primary btn-sm mt-auto">
                      Pre-Order in This Batch <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-white rounded-4 border text-muted">
              No upcoming scheduled batches for this product right now. Please check back soon!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
