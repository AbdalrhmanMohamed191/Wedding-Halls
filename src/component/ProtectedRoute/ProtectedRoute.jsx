import React from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../pages/context/AuthContext";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
}) => {
  const {
    user,
    loading,
  } = useAuth();

  const location = useLocation();

  /*
   * ----------------------------------------------------
   * AUTH IS STILL LOADING
   * ----------------------------------------------------
   */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #eadbc8",
            borderTopColor: "#d88a2b",
            borderRadius: "50%",
            animation:
              "protected-route-spin 0.8s linear infinite",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#777",
            fontSize: "14px",
          }}
        >
          Checking your account...
        </p>

        <style>
          {`
            @keyframes protected-route-spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  /*
   * ----------------------------------------------------
   * NOT LOGGED IN
   * ----------------------------------------------------
   */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /*
   * ----------------------------------------------------
   * ROLE CHECK
   * ----------------------------------------------------
   */

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
   * ----------------------------------------------------
   * AUTHORIZED
   * ----------------------------------------------------
   */

  return children;
};

export default ProtectedRoute;
