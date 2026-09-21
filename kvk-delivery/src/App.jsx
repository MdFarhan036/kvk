import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DeliveryLogin from "./components/DeliveryLogin";
import DeliveryOrders from "./components/DeliveryOrders";
import DeliveryProtectedRoute from "./components/DeliveryProtectedRoute";
import DeliveryOrderTracking from "./components/DeliveryOrderTracking";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            LOGIN
        ===================================================== */}
        <Route
          path="/login"
          element={<DeliveryLogin />}
        />

        {/* =====================================================
            PROTECTED DELIVERY ORDERS
        ===================================================== */}
        <Route
          path="/orders"
          element={
            <DeliveryProtectedRoute>
              <DeliveryOrders />
            </DeliveryProtectedRoute>
          }
        />
<Route
  path="/orders/:orderId/track"
  element={
    <DeliveryProtectedRoute>
      <DeliveryOrderTracking />
    </DeliveryProtectedRoute>
  }
/>
        {/* =====================================================
            DEFAULT
        ===================================================== */}
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* =====================================================
            UNKNOWN ROUTES
        ===================================================== */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
