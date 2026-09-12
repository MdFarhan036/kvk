import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api";

export const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showItems, setShowItems] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  // ============================================
  // FETCH ORDER
  // ============================================
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get(`/orders/${orderId}`);

        setOrder({
          id: data.id || "N/A",
          invoice: data.invoice || `INV-${data.id}`,
          customerName: data.customerName || "N/A",
          email: data.email || "N/A",
          mobile: data.mobile || "N/A",
          address: data.address || "N/A",
          orderDate: data.orderDate || data.date || null,
          totalCost: Number(data.totalCost || 0),
          status: data.status || "Pending",
          items: Array.isArray(data.items)
            ? data.items
            : [],
          logs: Array.isArray(data.logs)
            ? data.logs
            : [],
          promoCode: data.promoCode || "N/A",
        });
      } catch (err) {
        console.error("❌ Error fetching order:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load order. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // ============================================
  // SAVE ORDER STATUS
  // ============================================
  const handleSaveStatus = async () => {
    if (!order) return;

    setSaving(true);

    try {
      await api.put(`/orders/${order.id}`, {
        status: order.status,
      });

      alert("✅ Order status updated successfully!");
    } catch (err) {
      console.error("❌ Failed to update order:", err);
      alert("Failed to update order status.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING / ERROR STATES
  // ============================================
  if (loading) {
    return (
      <p className="loading">
        Loading order details...
      </p>
    );
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!order) {
    return (
      <p className="error">
        No order found
      </p>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
  <main className="order-details-page">

      {/* BACK */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back to Orders
      </button>

      {/* HEADER */}
      <div className="order-header">
        <h1>Order #{order.id}</h1>

        <span>
          Placed On:{" "}
          {order.orderDate
            ? new Date(
                order.orderDate
              ).toLocaleString()
            : "N/A"}
        </span>
      </div>

      {/* CUSTOMER DETAILS */}
      <div className="order-card">
        <h3>Customer Details</h3>

        <div className="order-basic-info">

          <p>
            <strong>Name:</strong>{" "}
            {order.customerName}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {order.email}
          </p>

          <p>
            <strong>Mobile:</strong>{" "}
            {order.mobile}
          </p>

          <p>
            <strong>Address:</strong>{" "}
            {order.address}
          </p>

          <p>
            <strong>Invoice:</strong>{" "}
            {order.invoice}
          </p>

          <p>
            <strong>Total Amount:</strong>{" "}
            ${order.totalCost.toFixed(2)}
          </p>

          <p>
            <strong>Status:</strong>{" "}

            <select
              value={order.status}
              onChange={(e) =>
                setOrder({
                  ...order,
                  status: e.target.value,
                })
              }
            >
              {[
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled",
              ].map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            <button
              className="save-btn"
              onClick={handleSaveStatus}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save"}
            </button>
          </p>

        </div>
      </div>

      {/* ORDER ITEMS */}
      <div className="order-card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() =>
            setShowItems(!showItems)
          }
        >
          <h3>Order Items</h3>

          <span>
            {showItems ? "−" : "+"}
          </span>
        </div>

        {showItems && (
          <>
            {order.items.length > 0 ? (
              <table className="order-items-table">

                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Billing Cycle</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map(
                    (item, idx) => (
                      <tr key={idx}>

                        <td>
                          {item.productImages?.[0] && (
                            <img
                              src={`${ASSET_BASE_URL}${item.productImages[0]}`}
                              alt={
                                item.productTitle ||
                                "Product"
                              }
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 4,
                                marginTop: 4,
                              }}
                            />
                          )}

                          {" - "}

                          {item.productTitle || "-"}
                        </td>

                        <td>
                          {item.description || "-"}
                        </td>

                        <td>
                          {item.billingCycle ||
                            "monthly"}
                        </td>

                        <td>
                          $
                          {Number(
                            item.amount || 0
                          ).toFixed(2)}
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            ) : (
              <p>
                No items found for this order.
              </p>
            )}
          </>
        )}
      </div>

      {/* ORDER LOGS */}
      {order.logs.length > 0 && (
        <div className="order-card collapsible-card">

          <div
            className="collapsible-header"
            onClick={() =>
              setShowLogs(!showLogs)
            }
          >
            <h3>Order Logs</h3>

            <span>
              {showLogs ? "−" : "+"}
            </span>
          </div>

          {showLogs && (
            <>
              <ul className="order-logs">

                {order.logs.map(
                  (log, idx) => (
                    <li key={idx}>

                      <span>
                        {log.message}
                      </span>

                      <span>
                        {log.date
                          ? new Date(
                              log.date
                            ).toLocaleString()
                          : "N/A"}
                      </span>

                    </li>
                  )
                )}

              </ul>

              <button className="load-more-btn">
                Load more
              </button>
            </>
          )}

        </div>
      )}

    </main>
  );
};