import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Common Pages
import Home from './pages/common/Home';
import About from './pages/common/About';
import Contact from './pages/common/Contact';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import NotFound from './pages/common/NotFound';

// Customer Pages
import AvailableBatches from './pages/customer/AvailableBatches';
import BatchDetails from './pages/customer/BatchDetails';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyOrders from './pages/customer/MyOrders';
import OrderDetails from './pages/customer/OrderDetails';
import CustomerProfile from './pages/customer/CustomerProfile';

// Business Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import BusinessProfile from './pages/owner/BusinessProfile';
import ManageProducts from './pages/owner/ManageProducts';
import AddProduct from './pages/owner/AddProduct';
import EditProduct from './pages/owner/EditProduct';
import ManageBatches from './pages/owner/ManageBatches';
import CreateBatch from './pages/owner/CreateBatch';
import OwnerBatchDetails from './pages/owner/OwnerBatchDetails';
import ManageOrders from './pages/owner/ManageOrders';
import OwnerOrderDetails from './pages/owner/OwnerOrderDetails';
import SalesReport from './pages/owner/SalesReport';

// Wrapper to hide general footer inside Owner dashboard pages for a sleek full-height experience
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isOwnerRoute = location.pathname.startsWith('/owner');

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1">{children}</div>
      {!isOwnerRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <LayoutWrapper>
            <Routes>
              {/* Common Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/batches" element={<AvailableBatches />} />
              <Route path="/batches/:id" element={<BatchDetails />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />

              {/* Customer Protected Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/orders/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'owner']}>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />

              {/* Business Owner Protected Routes */}
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/business-profile"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <BusinessProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/products"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <ManageProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/products/create"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/products/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/batches"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <ManageBatches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/batches/create"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <CreateBatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/batches/:id"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerBatchDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/orders"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <ManageOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/orders/:id"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerOrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/reports/sales"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <SalesReport />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LayoutWrapper>
          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
