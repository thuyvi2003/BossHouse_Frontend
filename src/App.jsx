/** ⛔⛔⛔   ℂẢℕℍ 𝔹Á𝕆 — ĐỌℂ 𝔽𝕀𝕃𝔼 README 𝕋ℝướℂ 𝕂ℍ𝕀 ℂ𝕆𝔻𝔼   ⛔⛔⛔ */

import { Routes, Route } from 'react-router-dom'
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

import LoginPage from "@/pages/auth/LoginPage";
import HomePage from "@/pages/HomePage";
import PromotionManagement from "./components/ui/Dashboard/PromotionManagement"
import Dashboard from './components/ui/Dashboard/Dashboard.jsx'

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoutes from './router/ProtectedRoute';

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoutes requiredRole="admin" />}>
          <Route path="/Dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App