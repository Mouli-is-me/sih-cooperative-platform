import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ProtectedRoute - Centralized authentication and role-based route guard.
 * Wraps private pages. Redirects to /signin if unauthenticated.
 * Optionally restricts by role via allowedRoles prop.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "#64748B",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid #E2E8F0",
              borderTopColor: "#4F46E5",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          Verifying session...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Role-based access check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    // platform_admin always has access
    if (userRole !== "platform_admin" && !allowedRoles.includes(userRole)) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
            padding: "40px 20px",
          }}
        >
          <div>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔒</div>
            <h2 style={{ color: "#1E293B", marginBottom: "8px" }}>
              Access Restricted
            </h2>
            <p style={{ color: "#64748B", maxWidth: "400px" }}>
              Your account role (<strong>{userRole}</strong>) does not have
              permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
}
