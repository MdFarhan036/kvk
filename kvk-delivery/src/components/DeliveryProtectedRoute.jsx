import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

export default function DeliveryProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const res = await api.get("/delivery/check-auth");

        if (!mounted) return;

        if (res.data?.isAuthenticated !== false) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (err) {
        console.error(
          "Delivery protected route auth error:",
          err
        );

        if (mounted) {
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // CHECKING AUTHENTICATION
  // =========================================================

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7f6",
          color: "#4b5563",
          fontSize: "15px",
          fontWeight: "500",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  // =========================================================
  // NOT AUTHENTICATED
  // =========================================================

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // =========================================================
  // AUTHENTICATED
  // =========================================================

  return children;
}
