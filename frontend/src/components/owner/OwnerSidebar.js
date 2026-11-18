import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OwnerSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="bb-sidebar shadow-sm">
      <div className="mb-4 px-2">
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 mb-2">
          Owner Portal
        </span>
        <h6 className="fw-bold text-dark mb-0 text-truncate">
          {user?.business?.name || user?.name + "'s Kitchen"}
        </h6>
        <small className="text-muted">Home Food Entrepreneur</small>
      </div>

      <nav className="nav flex-column gap-1 flex-grow-1">
        <NavLink
          to="/owner/dashboard"
          end
          className={({ isActive }) =>
            `bb-sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-speedometer2 bb-sidebar-icon"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/owner/batches"
          end
          className={({ isActive }) =>
            `bb-sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-calendar2-range bb-sidebar-icon"></i>
          <span>Manage Batches</span>
        </NavLink>

        <NavLink
          to="/owner/batches/create"
          className={({ isActive }) =>
            `bb-sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-plus-circle bb-sidebar-icon"></i>
          <span>Create New Batch</span>
        </NavLink>

        <NavLink
          to="/owner/products"
          end
          className={({ isActive }) =>
            `bb-sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-egg-fried bb-sidebar-icon"></i>
          <span>Manage Products</span>
        </NavLink>

        <NavLink
          to="/owner/products/create"
          className={({ isActive }) =>
            `bb-sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-patch-plus bb-sidebar-icon"></i>
          <span>Add New Product</span>
        </NavLink>

        <NavLink
          to="/owner/orders"
          className={({ isActive }) =>
            `bb-sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-receipt-cutoff bb-sidebar-icon"></i>
          <span>Customer Orders</span>
        </NavLink>

        <NavLink
          to="/owner/reports/sales"
          className={({ isActive }) =>
            `bb-sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-graph-up-arrow bb-sidebar-icon"></i>
          <span>Sales & Analytics</span>
        </NavLink>

        <hr className="my-3 text-muted" />

        <NavLink
          to="/owner/business-profile"
          className={({ isActive }) =>
            `bb-sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-shop-window bb-sidebar-icon"></i>
          <span>Business Profile</span>
        </NavLink>

        <NavLink
          to="/batches"
          className="bb-sidebar-link text-secondary"
        >
          <i className="bi bi-box-arrow-up-right bb-sidebar-icon"></i>
          <span>Customer View</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default OwnerSidebar;
