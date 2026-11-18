import React from 'react';

export const OrderStatusBadge = ({ status }) => {
  const map = {
    PENDING: { bg: 'warning text-dark', label: 'Pending Review', icon: 'bi-clock-history' },
    CONFIRMED: { bg: 'info text-white', label: 'Confirmed', icon: 'bi-check-circle' },
    PREPARING: { bg: 'primary text-white', label: 'In Kitchen / Baking', icon: 'bi-fire' },
    READY: { bg: 'success text-white', label: 'Ready for Pickup', icon: 'bi-box-seam' },
    COMPLETED: { bg: 'dark text-white', label: 'Completed', icon: 'bi-award' },
    CANCELLED: { bg: 'secondary text-white', label: 'Cancelled', icon: 'bi-x-circle' },
    REJECTED: { bg: 'danger text-white', label: 'Rejected', icon: 'bi-slash-circle' },
  };

  const current = map[status] || { bg: 'secondary text-white', label: status, icon: 'bi-dot' };

  return (
    <span className={`badge bg-${current.bg} px-3 py-2 rounded-pill fw-medium`}>
      <i className={`bi ${current.icon} me-1`}></i>
      {current.label}
    </span>
  );
};

export const BatchStatusBadge = ({ status }) => {
  const map = {
    OPEN: { bg: 'success', label: 'Open for Orders' },
    CLOSED: { bg: 'secondary', label: 'Order Window Closed' },
    PREPARING: { bg: 'warning text-dark', label: 'Baking / Prep Phase' },
    READY: { bg: 'info text-white', label: 'Ready for Pickup' },
    COMPLETED: { bg: 'dark', label: 'Batch Fulfilled' },
    CANCELLED: { bg: 'danger', label: 'Batch Cancelled' },
  };

  const current = map[status] || { bg: 'secondary', label: status };

  return (
    <span className={`badge bg-${current.bg} px-2 py-1 rounded-pill`}>
      {current.label}
    </span>
  );
};

export const DietaryBadges = ({ dietaryFlags = {} }) => {
  const { isVegetarian, isVegan, isGlutenFree, isNutFree, isHalal } = dietaryFlags;

  return (
    <div className="d-flex flex-wrap gap-1">
      {isVegetarian && (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
          <i className="bi bi-flower1 me-1"></i>Vegetarian
        </span>
      )}
      {isVegan && (
        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">
          <i className="bi bi-tree me-1"></i>Vegan
        </span>
      )}
      {isGlutenFree && (
        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
          <i className="bi bi-shield-check me-1"></i>Gluten-Free
        </span>
      )}
      {isHalal && (
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
          <i className="bi bi-patch-check me-1"></i>Halal
        </span>
      )}
      {isNutFree && (
        <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25">
          Nut-Free
        </span>
      )}
    </div>
  );
};
