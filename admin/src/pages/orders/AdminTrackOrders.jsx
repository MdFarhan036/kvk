import React, { useEffect, useState } from "react";
import api from "../api";

export const AdminTrackOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = ["Placed", "Packed", "Shipped", "Delivered"];

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      fetchOrders(); // refresh after update
    } catch (err) {
      console.error(err);
      alert("Failed to update order status.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="admin-track-orders">
      <h1>Admin Order Management</h1>
      {loading && <p>Loading orders...</p>}
      {error && <p className="text-danger">{error}</p>}

      <table className="table orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const currentStep = steps.indexOf(order.status);
            return (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>${order.totalCost}</td>
                <td>
                  <div className="order-progress">
                    {steps.map((step, idx) => (
                      <span
                        key={step}
                        className={`progress-step ${
                          idx <= currentStep ? "completed" : ""
                        }`}
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {steps.map((step) => (
                    <button
                      key={step}
                      disabled={steps.indexOf(step) <= currentStep}
                      onClick={() => updateOrderStatus(order.id, step)}
                      className="btn btn-update"
                    >
                      {step}
                    </button>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
