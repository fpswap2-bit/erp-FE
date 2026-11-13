import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export default function ProtectedRoute({
    allowedRoles,
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, roles } = useAuthStore();

    if (isLoading) {
        return <div className="p-8">Loading session...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (
        allowedRoles &&
        !allowedRoles.some((role) => roles.includes(role))
    ) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}