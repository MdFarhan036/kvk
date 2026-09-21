import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./MyAddresses.css";
import { useCustomerAuth } from "../../context/CustomerContext";

export const MyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useCustomerAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isProfile =
    location.pathname === "/account" ||
    location.pathname === "/account/profile";

  const isPassword =
    location.pathname.startsWith("/account/password");

  const isAddresses =
    location.pathname.startsWith("/account/addresses");

  return (
    <div className="my-account">

      <nav className="my-account-nav">

        <Link
          to="/account/profile"
          className={
            isProfile
              ? "my-account-nav-link active"
              : "my-account-nav-link"
          }
        >
          👤 My Account
        </Link>

        <Link
          to="/account/password"
          className={
            isPassword
              ? "my-account-nav-link active"
              : "my-account-nav-link"
          }
        >
          🔐 Change Password
        </Link>

        <Link
          to="/account/addresses"
          className={
            isAddresses
              ? "my-account-nav-link active"
              : "my-account-nav-link"
          }
        >
          📍 My Addresses
        </Link>

        <button
          type="button"
          className="my-account-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </nav>

      <div className="my-account-content">
        <Outlet />
      </div>

    </div>
  );
};