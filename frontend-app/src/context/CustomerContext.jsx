import { createContext, useContext, useState, useEffect } from "react";
import api from "../components/api.js";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ SAFE AUTH CHECK (NEVER STUCK)
  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/customer/check-auth", {
        withCredentials: true,
      });

      if (res.data?.isAuthenticated) {
        setCustomer(res.data.user);
        return res.data.user;
      } else {
        setCustomer(null);
        return null;
      }
    } catch (err) {
      console.error("checkAuth failed:", err.response?.data || err.message);
      setCustomer(null);
      return null;
    } finally {
      setLoading(false); // ✅ GUARANTEED TO RUN
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ COOKIE BASED LOGIN
  const login = async (email, password) => {
    await api.post(
      "/auth/customer/login",
      { email, password },
      { withCredentials: true }
    );

    return await checkAuth(); // ✅ refresh user via cookie
  };

  // ✅ COOKIE BASED LOGOUT
  const logout = async () => {
    try {
      await api.post(
        "/auth/customer/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.warn("Logout failed:", err);
    } finally {
      setCustomer(null);
    }
  };

  return (
    <CustomerContext.Provider
      value={{ customer, loading, login, logout }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used inside CustomerProvider");
  }
  return context;
};
