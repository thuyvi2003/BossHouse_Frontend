import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { GoogleOAuthProvider } from '@react-oauth/google';

import Dashboard from './pages/DashboardPage.jsx';
import ProtectedRoute from './router/ProtectedRoute.jsx';
import Cart from './pages/CartPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import BlogScreen from './pages/BlogPage.jsx';
import PostDetail from './pages/PostDetail.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerifyOtpPage from './pages/auth/VerifyOtpPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import Services from './pages/Services.jsx';
import UserBookingForm from './pages/UserBookingForm.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProfileLayout from './components/ui/Profile/ProfileLayout.jsx';
import PetProfileManagement from './pages/PetProfileManagement.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ContactHistory from "./pages/ContactHistory.jsx";
import BookingHistory from "./pages/BookingHistory.jsx";
import NotificationsPage from './pages/NotificationsPage.jsx';
import NotificationDetailPage from './pages/NotificationDetailPage.jsx';
import ScheduleManager from './components/ui/Dashboard/Schedule/ScheduleManager.jsx';
import ChatAIWidget from "./components/ChatAIWidget.jsx";
import WishlistPage from './pages/WishlistPage.jsx';
import WishlistGroupsPage from './components/ui/Wishlist/WishlistGroupsPage.jsx';
import SharedWishlistPage from './components/ui/Wishlist/SharedWishlistPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import VetSchedulePage from "./pages/VetSchedulePage";
import MembershipPage from './pages/MembershipPage.jsx';
import VetSchedulePage from "./pages/VetSchedulePage.jsx";

function App() {
  const location = useLocation();
  const { checkAuth, user } = useAuthStore();
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const authRoutes = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password"
  ];
  const hideLayout = authRoutes.includes(location.pathname);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col min-h-screen">
        {!hideLayout && <Navbar />}

        <main className="flex-grow">
          <Routes>
            {/* Authentication */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Products */}
            <Route path="/products" element={<ProductPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route element={<ProtectedRoute requiredRoles={["admin", "staff"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            
            {/* Dashboard & Cart */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<Cart />} />

            {/* Blog */}
            <Route path="/post" element={<BlogScreen />} />
            <Route path="/post/:id" element={<PostDetail />} />

            {/* Services */}
            <Route path="/services" element={<Services />} />
            <Route path="/user-booking" element={<UserBookingForm />} />

            {/* Profile Pages */}
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="pets" element={<PetProfileManagement user={user} />} />
              <Route path="contact-history" element={<ContactHistory />} />
              <Route path="booking-history" element={<BookingHistory />} />
              <Route path="orders/my" element={<MyOrdersPage />} />
              <Route path="wishlist" element={<WishlistPage />} >
                <Route path="groups" element={<WishlistGroupsPage />} />
              </Route>
              <Route path="schedule" element={<VetSchedulePage />} />
            </Route>

            <Route path="/share/wishlist/:groupId" element={<SharedWishlistPage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="contact-history" element={<ContactHistory />} />
              <Route path="booking-history" element={<BookingHistory />} />
              <Route path="membership" element={<MembershipPage />} />   {/* thêm dòng này */}
              <Route path="orders/my" element={<MyOrdersPage />} />
              <Route path="schedule" element={<VetSchedulePage />} />
            </Route>

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/notifications/:id" element={<NotificationDetailPage />} />

            {/* Checkout */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Admin/Dashboard Schedules */}
            <Route path="/schedules" element={<ScheduleManager />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </main>

        {!hideLayout && (
          <>
            <ChatAIWidget />
            <Footer />
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
