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

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH ORDER
  // =====================================================

  const fetchOrder = async (id) => {
    const trimmedId =
      String(id || "").trim();

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
        err?.response?.data?.message ||
          "No order found. Please check your Order ID."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // AUTO LOAD ORDER
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

  const currentStep = order?.status
    ? steps.indexOf(order.status)
    : -1;

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

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
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
  // GET ORDER ADDRESS
  // =====================================================

  const orderAddress =
    order?.orderAddress ||
    order?.address ||
    null;

  // =====================================================
  // GET DELIVERY COORDINATES
  // =====================================================

  const latitude =
    orderAddress?.latitude ??
    orderAddress?.lat ??
    null;

  const longitude =
    orderAddress?.longitude ??
    orderAddress?.lng ??
    null;

  const hasCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    latitude !== "" &&
    longitude !== "";

  // =====================================================
  // OPEN DELIVERY LOCATION
  // =====================================================

  const handleViewLocation = () => {
    if (!hasCoordinates) {
      return;
    }

    const mapsUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${latitude},${longitude}`
      )}`;

    window.open(
      mapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="track-order-container">

      <h1>
        Track Your Order
      </h1>

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
                width:
                  progressWidth,
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

                  <p>
                    {step}
                  </p>

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
              DELIVERY ADDRESS
          ================================================= */}

          <h4 className="mt-30">
            Delivery Address
          </h4>

          {orderAddress ? (

            <div className="order-delivery-address">

              <div className="order-address-header">

                <strong>
                  {orderAddress.addressType ||
                    "Delivery Address"}
                </strong>

                {hasCoordinates && (
                  <button
                    type="button"
                    className="btn-view-location"
                    onClick={
                      handleViewLocation
                    }
                  >
                    📍 View Delivery Location
                  </button>
                )}

              </div>

              <div className="order-address-body">

                <p>
                  <strong>
                    {orderAddress.fullName ||
                      order.customerName ||
                      "N/A"}
                  </strong>
                </p>

                <p>
                  Mobile:{" "}
                  {orderAddress.mobile ||
                    order.mobile ||
                    "N/A"}
                </p>

                {orderAddress.houseNo && (
                  <p>
                    {orderAddress.houseNo}
                    {orderAddress.addressLine1
                      ? `, ${orderAddress.addressLine1}`
                      : ""}
                  </p>
                )}

                {!orderAddress.houseNo &&
                  orderAddress.addressLine1 && (
                    <p>
                      {orderAddress.addressLine1}
                    </p>
                  )}

                {orderAddress.addressLine2 && (
                  <p>
                    {orderAddress.addressLine2}
                  </p>
                )}

                {orderAddress.landmark && (
                  <p>
                    Landmark:{" "}
                    {orderAddress.landmark}
                  </p>
                )}

                <p>
                  {orderAddress.city},{" "}
                  {orderAddress.state} -{" "}
                  {orderAddress.pincode}
                </p>

                <p>
                  {orderAddress.country ||
                    "India"}
                </p>

                {hasCoordinates && (
                  <p className="delivery-coordinates">
                    <strong>
                      Location:
                    </strong>{" "}
                    {Number(latitude).toFixed(
                      6
                    )},{" "}
                    {Number(longitude).toFixed(
                      6
                    )}
                  </p>
                )}

              </div>

            </div>

          ) : (

            <div className="order-no-address">
              Delivery address information
              is not available for this order.
            </div>

          )}

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