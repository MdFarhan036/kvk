import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DeliveryLogin.css";

export default function DeliveryLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // CHECK EXISTING DELIVERY LOGIN
  // =========================================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/delivery/check-auth");

        if (res.data?.isAuthenticated !== false) {
          navigate("/orders", { replace: true });
          return;
        }
      } catch (err) {
        // Not logged in — stay on login page
        console.log("Delivery auth check:", err.response?.status);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // =========================================================
  // INPUT CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/delivery/login", {
        email: form.email.trim(),
        password: form.password,
      });

      console.log("Delivery login response:", res.data);

      // Cookie is set by backend.
      // We intentionally do NOT store token in localStorage.
      navigate("/orders", { replace: true });
    } catch (err) {
      console.error("Delivery login error:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING AUTH CHECK
  // =========================================================
  if (checkingAuth) {
    return (
      <div className="delivery-login-page">
        <div className="delivery-login-loading">
          Checking authentication...
        </div>
      </div>
    );
  }

  // =========================================================
  // LOGIN UI
  // =========================================================
  return (
    <div className="delivery-login-page">

      <div className="delivery-login-card">

        {/* LOGO / ICON */}
        <div className="delivery-login-icon">
          🚚
        </div>

        <div className="delivery-login-header">
          <h1>Delivery Panel</h1>

          <p>
            Login to manage your assigned deliveries
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="delivery-login-error">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="delivery-form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />

          </div>

          {/* PASSWORD */}
          <div className="delivery-form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />

          </div>

          {/* LOGIN */}
          <button
            type="submit"
            className="delivery-login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="delivery-login-footer">
          <span>KVK Delivery Management</span>
        </div>

      </div>

    </div>
  );
}
