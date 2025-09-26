import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

import Dashboard from './pages/DashboardScreen.jsx';
import Cart from './pages/CartScreen.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import BlogScreen from './pages/BlogScreen.jsx';
import PostDetail from './pages/PostDetail.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerifyOtpPage from './pages/auth/VerifyOtpPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import Services from './pages/Services.jsx';           
import UserBookingForm from './pages/UserBookingForm.jsx'; 


function App() {

  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  const authRoutes = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password"];
  const hideLayout = authRoutes.includes(location.pathname)
  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/post" element={<BlogScreen />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/user-booking" element={<UserBookingForm />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={5000} />

      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
