import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { LocationProvider, useLocation } from "@/contexts/LocationContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "sonner";
import { LocationModal } from "@/components/location/LocationModal";
import { useEffect } from "react";
import { ScrollToTop } from "@/components/utils/ScrollToTop";
import { Home } from "@/pages/Home";
import { Search } from "@/pages/Search";
import { ProductDetails } from "@/pages/ProductDetails";
import { ServiceDetails } from "@/pages/ServiceDetails";
import { Cart } from "@/pages/Cart";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { Profile } from "@/pages/dashboard/Profile";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { Categories as AdminCategories } from "@/pages/admin/Categories";
import { Settings as AdminSettings } from "@/pages/admin/Settings";
import { Acquirers as AdminAcquirers } from "@/pages/admin/Acquirers";
import { Services as AdminServices } from "@/pages/admin/Services";
import { Products as AdminProducts } from "@/pages/admin/Products";
import { Users as AdminUsers } from "@/pages/admin/Users";
import { Payments as AdminPayments } from "@/pages/admin/Payments";
import { Support as AdminSupport } from "@/pages/admin/Support";
import { Login } from "@/pages/Login";
import { Quotes } from "@/pages/Quotes";
import { Favorites } from "@/pages/Favorites";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";

function AppRoutes() {
  const { user, loading } = useAuth();
  const { locationName, setIsLocationModalOpen } = useLocation();

  useEffect(() => {
    // Show location modal if user is not logged in and hasn't selected a location yet (or default)
    // Using sessionStorage to show only once per session to avoid annoyance
    if (!loading && !user) {
       const hasSeenModal = sessionStorage.getItem("partex_has_seen_location_modal");
       if (!hasSeenModal) {
           setIsLocationModalOpen(true);
           sessionStorage.setItem("partex_has_seen_location_modal", "true");
       }
    }
  }, [loading, user, setIsLocationModalOpen]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/service/:id" element={<ServiceDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/acquirers"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminAcquirers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
      <LocationModal />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <LocationProvider>
          <Router>
            <ScrollToTop />
            <AppRoutes />
          </Router>
          <Toaster position="top-right" richColors />
        </LocationProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}

export default App;
