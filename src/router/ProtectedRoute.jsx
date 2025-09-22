import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes({ requiredRole }) {
    const { user } = useAuthStore();

    // If user is not logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If a specific role is required and the user doesn't have it, redirect to homepage
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    // Otherwise, allow the child routes to render
    return <Outlet />;
}
