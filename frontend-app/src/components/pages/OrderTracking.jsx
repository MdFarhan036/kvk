import { useState } from "react";

import api from "../api.js";

import "./OrderTracking.css";

export const OrderTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ============================================
  // TRACK ORDER
  // ============================================

  const handleTrackOrder = async () => {
    if (!orderId.trim()) {
      setErrorMsg("Please enter a valid order ID.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setOrderData(null);

      const { data } = await api.get(
        `/orders/${encodeURIComponent(
          orderId.trim()
        )}`
      );

      if (!data) {
        setErrorMsg(
          "No order found with this ID."
        );
      } else {
        setOrderData(data);
      }
    } catch (err) {
      console.error(
        "❌ Error fetching order status:",
        err
      );

      setErrorMsg(
        err.response?.data?.message ||
          "Failed to fetch order. Please check the ID or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FORMAT PRICE
  // ============================================

  const formatPrice = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ============================================
  // ENTER KEY
  // ============================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleTrackOrder();
    }
  };

  return (
    <div className="order-tracking-container">

      {/* ========================================
          HEADER
      ======================================== */}

      <h1>Track Your Order</h1>

      <p className="order-tracking-subtitle">
        Enter your order ID to check your
        order status.
      </p>

      {/* ========================================
          INPUT
      ======================================== */}

      <div className="track-input-group">

        <input
          type="text"
          placeholder="Enter your Order ID"
          value={orderId}
          onChange={(e) =>
            setOrderId(e.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button
          type="button"
          onClick={handleTrackOrder}
          disabled={loading}
        >
          {loading
            ? "Fetching..."
            : "Track Order"}
        </button>

      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {errorMsg && (
        <p className="error-msg">
          {errorMsg}
        </p>
      )}

      {/* ========================================
          ORDER DETAILS
      ======================================== */}

      {orderData && (

        <div className="order-details">

          <h2>Order Details</h2>

          {/* ORDER SUMMARY */}

          <div className="order-summary">

            <div>
              <span>Order ID</span>
              <strong>
                #
                {orderData.id ||
                  orderData.orderId ||
                  orderId}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {orderData.status ||
                  "Pending"}
              </strong>
            </div>

            <div>
              <span>Date</span>
              <strong>
                {formatDate(
                  orderData.date ||
                    orderData.orderDate ||
                    orderData.created_at ||
                    orderData.createdAt
                )}
              </strong>
            </div>

            <div>
              <span>Payment</span>
              <strong>
                {orderData.paymentMethod ||
                  orderData.payment_method ||
                  "N/A"}
              </strong>
            </div>

            <div>
              <span>Total Amount</span>
              <strong>
                {formatPrice(
                  orderData.totalCost ??
                    orderData.total
                )}
              </strong>
            </div>

          </div>

          {/* ======================================
              ITEMS
          ====================================== */}

          {Array.isArray(orderData.items) &&
            orderData.items.length > 0 && (

            <div className="order-items">

              <h3>Items</h3>

              <div className="order-items-table-wrapper">

                <table className="table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>

                    {orderData.items.map(
                      (item, idx) => (

                        <tr
                          key={
                            item.id ||
                            `${orderData.id}-${idx}`
                          }
                        >

                          <td>
                            {item.productTitle ||
                              item.product_title ||
                              item.title ||
                              item.name ||
                              item.description ||
                              "Product"}
                          </td>

                          <td>
                            {item.quantity || 1}
                          </td>

                          <td>
                            {formatPrice(
                              item.amount ??
                                item.productPrice ??
                                item.product_price ??
                                item.price
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          {/* ======================================
              DELIVERY INFO
          ====================================== */}

          {orderData.billingInfo && (

            <div className="delivery-info">

              <h3>Delivery Address</h3>

              <p>

                {orderData.billingInfo.fname ||
                  orderData.billingInfo.firstName ||
                  ""}{" "}

                {orderData.billingInfo.lname ||
                  orderData.billingInfo.lastName ||
                  ""}

                <br />

                {orderData.billingInfo.address ||
                  ""}

                <br />

                {orderData.billingInfo.city ||
                  ""}

                {orderData.billingInfo.pincode
                  ? ` - ${orderData.billingInfo.pincode}`
                  : ""}

                <br />

                {orderData.billingInfo.mobile && (
                  <>
                    <strong>
                      Mobile:
                    </strong>{" "}
                    {
                      orderData.billingInfo.mobile
                    }
                  </>
                )}

              </p>

            </div>

          )}

        </div>

      )}

    </div>
  );
};