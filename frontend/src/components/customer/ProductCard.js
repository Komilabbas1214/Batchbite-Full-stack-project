import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DietaryBadges } from '../common/Badge';

const ProductCard = ({
  product,
  batchItem,
  batch,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(batchItem?.minOrderPerCustomer || 1);

  const price = batchItem ? batchItem.price : product?.basePrice;
  const isAvailable = batchItem ? batchItem.availableQuantity > 0 : product?.isActive;
  const remaining = batchItem ? batchItem.availableQuantity : null;
  const minQty = batchItem?.minOrderPerCustomer || 1;
  const maxQty = batchItem ? Math.min(batchItem.availableQuantity, batchItem.maxOrderPerCustomer || 10) : 10;

  const handleAdd = () => {
    if (onAddToCart && batchItem && batch) {
      onAddToCart(batch, batchItem, quantity);
    }
  };

  return (
    <div className="card h-100 bb-card border-0 shadow-sm d-flex flex-column">
      <div className="bb-card-img-wrapper">
        <img
          src={product?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
          alt={product?.name}
          className="bb-card-img"
        />
        <span className="bb-badge-category">
          {product?.category || 'Artisan Dish'}
        </span>

        {batchItem && (
          <div className="bb-badge-floating">
            {remaining === 0 ? (
              <span className="badge bg-danger text-white px-2 py-1 shadow-sm">
                Sold Out
              </span>
            ) : remaining <= 5 ? (
              <span className="badge bg-warning text-dark px-2 py-1 shadow-sm">
                Only {remaining} left!
              </span>
            ) : (
              <span className="badge bg-success text-white px-2 py-1 shadow-sm">
                {remaining} available
              </span>
            )}
          </div>
        )}
      </div>

      <div className="card-body p-3 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6 className="fw-bold mb-0 text-dark">
            <Link to={`/products/${product?._id}`} className="text-dark text-decoration-none">
              {product?.name}
            </Link>
          </h6>
          <span className="fs-5 fw-bold text-danger ms-2 text-nowrap">
            ₹{Number(price).toFixed(2)}
          </span>
        </div>

        {product?.portionSize && (
          <small className="text-muted mb-2 d-block">
            <i className="bi bi-pie-chart me-1"></i>
            {product.portionSize}
          </small>
        )}

        <p className="card-text text-muted small flex-grow-1 mb-3">
          {product?.description
            ? product.description.slice(0, 90) + (product.description.length > 90 ? '...' : '')
            : 'Fresh artisanal item prepared with quality ingredients.'}
        </p>

        {product?.dietaryFlags && (
          <div className="mb-3">
            <DietaryBadges dietaryFlags={product.dietaryFlags} />
          </div>
        )}

        {/* Action Controls for Batch View */}
        {batchItem && (
          <div className="mt-auto pt-2 border-top">
            {isAvailable ? (
              <div className="d-flex gap-2 align-items-center">
                <div className="input-group input-group-sm" style={{ width: '105px' }}>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(minQty, prev - 1))}
                    disabled={quantity <= minQty}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control text-center p-0"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setQuantity(Math.min(Math.max(val, minQty), maxQty));
                      }
                    }}
                    min={minQty}
                    max={maxQty}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(maxQty, prev + 1))}
                    disabled={quantity >= maxQty}
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn-bb-primary btn-sm flex-grow-1"
                  onClick={handleAdd}
                  disabled={remaining === 0}
                >
                  <i className="bi bi-cart-plus me-1"></i> Add
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary btn-sm w-100" disabled>
                Sold Out in this Batch
              </button>
            )}
          </div>
        )}

        {!batchItem && (
          <div className="mt-auto pt-2 border-top">
            <Link to={`/products/${product?._id}`} className="btn btn-bb-outline btn-sm w-100">
              View Product Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
