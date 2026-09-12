import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../api.js";

import "./TrackMyOrder.css";

export const TrackMyOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialOrderId =
    location.state?.orderId || "";

  const [orderId, setOrderId] =
    useState(initialOrderId);

  const [order, setOrder] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH ORDER FROM API
  // =====================================================

  const fetchOrder = async (id) => {
    const trimmedId = String(id || "").trim();

    if (!trimmedId) {
      setOrder(null);
      setError(
        "Please enter a valid Order ID."
      );
      return;
    }

    try {
      setError("");
      setLoading(true);
      setOrder(null);

      const { data } = await api.get(
        `/orders/public/orders/${encodeURIComponent(
          trimmedId
        )}`
      );

      if (!data) {
        setError(
          "No order found. Please check your Order ID."
        );
        return;
      }

      setOrder(data);
    } catch (err) {
      console.error(
        "❌ TRACK ORDER ERROR:",
        err
      );

      setOrder(null);

      setError(
        err.response?.data?.message ||
          "No order found. Please check your Order ID."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // AUTO-LOAD ORDER
  // =====================================================

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  // =====================================================
  // TRACKING STEPS
  // =====================================================

  const steps = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // =====================================================
  // FIND ACTIVE STEP
  // =====================================================

  const currentStep = order?.status
    ? steps.indexOf(order.status)
    : -1;

  // =====================================================
  // PROGRESS WIDTH
  // =====================================================

  const progressWidth =
    currentStep >= 0
      ? `${(currentStep /
          (steps.length - 1)) *
          100}%`
      : "0%";

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="track-order-container">

      <h1>Track Your Order</h1>

      {/* =================================================
          ORDER ID INPUT
      ================================================= */}

      <div className="track-input-box">

        <input
          type="text"
          placeholder="Enter your Order ID"
          value={orderId}
          onChange={(e) =>
            setOrderId(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !loading
            ) {
              fetchOrder(orderId);
            }
          }}
          disabled={loading}
        />

        <button
          type="button"
          className="btn btn-track"
          onClick={() =>
            fetchOrder(orderId)
          }
          disabled={loading}
        >
          {loading
            ? "Tracking..."
            : "Track Order"}
        </button>

      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <p className="track-loading">
          Loading your order...
        </p>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (
        <p className="text-danger">
          {error}
        </p>
      )}

      {/* =================================================
          ORDER DETAILS
      ================================================= */}

      {order && !loading && (

        <div className="order-details">

          <h3>
            Order ID:{" "}
            {order.id ||
              order.orderId}
          </h3>

          <h5>
            Date:{" "}
            {formatDate(
              order.orderDate ||
                order.date ||
                order.created_at ||
                order.createdAt
            )}
          </h5>

          <h5>
            Total: ₹
            {formatPrice(
              order.totalCost ??
                order.total
            )}
          </h5>

          <h5>
            Status:{" "}
            {order.status ||
              "Pending"}
          </h5>

          {/* =================================================
              PROGRESS TRACKER
          ================================================= */}

          <div className="order-progress">

            <div className="progress-line" />

            <div
              className="progress-line-fill"
              style={{
                width: progressWidth,
              }}
            />

            {steps.map(
              (step, index) => (

                <div
                  key={step}
                  className={`progress-step ${
                    index <= currentStep
                      ? "completed"
                      : ""
                  }`}
                >

                  <div className="circle">
                    {index + 1}
                  </div>

                  <p>{step}</p>

                </div>

              )
            )}

          </div>

          {/* =================================================
              CUSTOMER INFO
          ================================================= */}

          <h4 className="mt-30">
            Customer Info
          </h4>

          <p>
            <strong>Name:</strong>{" "}
            {order.customerName ||
              "N/A"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {order.email ||
              "N/A"}
          </p>

          <p>
            <strong>Mobile:</strong>{" "}
            {order.mobile ||
              "N/A"}
          </p>

          {/* =================================================
              ORDER ITEMS
          ================================================= */}

          <h4 className="mt-30">
            Order Items
          </h4>

          <div className="order-items-table-wrapper">

            <table className="table order-items-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                {Array.isArray(
                  order.items
                ) &&
                order.items.length > 0 ? (

                  order.items.map(
                    (item, idx) => (

                      <tr
                        key={
                          item.id ||
                          idx
                        }
                      >

                        <td>
                          {idx + 1}
                        </td>

                        <td>
                          {item.productTitle ||
                            item.product_title ||
                            item.title ||
                            item.name ||
                            item.description ||
                            "Product"}
                        </td>

                        <td>
                          {item.quantity ||
                            1}
                        </td>

                        <td>
                          ₹
                          {formatPrice(
                            item.amount ??
                              item.productPrice ??
                              item.product_price ??
                              item.price
                          )}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign:
                          "center",
                      }}
                    >
                      No items in this
                      order.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* =================================================
          BACK TO HOME
      ================================================= */}

      <button
        type="button"
        className="btn btn-back"
        onClick={() =>
          navigate("/")
        }
      >
        Back to Home
      </button>

    </div>
  );
};