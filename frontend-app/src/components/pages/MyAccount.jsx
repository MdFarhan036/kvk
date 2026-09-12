import { Link, Outlet, useNavigate } from "react-router-dom";
import api from "../api.js";

export const MyAccount = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = async () => {
    try {
      // Use backend logout if your auth route supports it.
      // If the endpoint is not available, the local
      // authentication data is still cleared below.
      await api.post("/auth/customer/logout");
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <div className="my-account">

      {/* ============================================
          ACCOUNT NAVIGATION
      ============================================ */}

      <nav
        className="my-account-nav"
        style={{ marginBottom: "20px" }}
      >

        {!token && (
          <>
            <Link
              to="/signup"
              style={{ marginRight: "10px" }}
            >
              Signup
            </Link>

            <Link
              to="/login"
              style={{ marginRight: "10px" }}
            >
              Login
            </Link>
          </>
        )}

        {token && (
          <>
            <Link
              to="/dashboard"
              style={{ marginRight: "10px" }}
            >
              Dashboard
            </Link>

            <Link
              to="/account"
              style={{ marginRight: "10px" }}
            >
              My Account
            </Link>

            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </nav>

      {/* ============================================
          CHILD ACCOUNT ROUTES
      ============================================ */}

      <Outlet />

    </div>
  );
};