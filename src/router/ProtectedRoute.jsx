import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ requiredRoles }) {
    const { user } = useAuthStore();

    // If user is not logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required and the user doesn't have one of them, redirect to homepage
    if (requiredRoles && !requiredRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // Otherwise, allow the child routes to render
    return <Outlet />;
}
