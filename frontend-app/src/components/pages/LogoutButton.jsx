// src/components/LogoutButton.jsx
import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../../context/CustomerContext";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useCustomerAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};
