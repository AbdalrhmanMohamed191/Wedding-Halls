import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../../api/axios";

const AdminRoute = () => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        const user = response.data?.data;

        if (user?.role === "admin" && user?.isActive !== false) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        console.error("Admin authorization error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fb",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-warning"
            role="status"
          />

          <p className="mt-3 mb-0 text-muted">
            Checking authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Admin access required",
        }}
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;