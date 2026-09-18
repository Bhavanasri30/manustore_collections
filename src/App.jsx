import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ContactPage from './pages/ContactPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import OwnerAuthPage from './pages/OwnerAuthPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ChatbotWidget from './components/ChatbotWidget';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <Navigate to={allowedRoles?.includes('owner') ? '/owner-login' : '/customer-login'} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === 'owner' ? '/owner-dashboard' : '/'} replace />;
  }

  return children;
}

function CustomerAuthGate() {
  const { currentUser, logout } = useStore();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'customer') {
      logout();
    }
  }, [currentUser, logout]);

  if (currentUser?.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  return <CustomerAuthPage />;
}

function OwnerAuthGate() {
  const { currentUser, logout } = useStore();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'owner') {
      logout();
    }
  }, [currentUser, logout]);

  if (currentUser?.role === 'owner') {
    return <Navigate to="/owner-dashboard" replace />;
  }

  return <OwnerAuthPage />;
}

function AppRoutes() {
  const { currentUser } = useStore();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/customer-login" element={<CustomerAuthGate />} />
          <Route path="/owner-login" element={<OwnerAuthGate />} />
          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ChatbotWidget />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppRoutes />
    </StoreProvider>
  );
}
