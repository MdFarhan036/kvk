import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerContext.jsx";

export const CustomerProtectedRoute = ({ children }) => {
  const { customer, loading } = useCustomerAuth();

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
