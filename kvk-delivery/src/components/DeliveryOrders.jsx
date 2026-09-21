import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./DeliveryOrders.css";

export default function DeliveryOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // DELIVERY VERIFICATION
  // =========================================================

  const [verificationModal, setVerificationModal] =
    useState(null);

  const [verificationCode, setVerificationCode] =
    useState("");

  // =========================================================
  // GPS WATCH REFERENCES
  // =========================================================

  const watchRefs = useRef({});

  // =========================================================
  // FETCH ASSIGNED ORDERS
  // =========================================================

  const fetchOrders = async () => {
    try {
      setError("");

      const res = await api.get(
        "/delivery/my-assignments"
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.assignments || [];

      setOrders(data);
    } catch (err) {
      console.error(
        "Fetch delivery orders error:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load delivery orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL FETCH + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(
      fetchOrders,
      10000
    );

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // ACCEPT ORDER
  // =========================================================

  const handleAccept = async (
    assignmentId
  ) => {
    try {
      setActionLoading(assignmentId);

      await api.post("/delivery/accept", {
        assignmentId,
      });

      await fetchOrders();
    } catch (err) {
      console.error(
        "Accept assignment error:",
        err
      );

      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to accept delivery."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // START DELIVERY
  // =========================================================

  const handleStartDelivery = async (
    assignmentId,
    orderId
  ) => {
    try {
      setActionLoading(assignmentId);

      await api.post("/delivery/start", {
        assignmentId,
      });

      await fetchOrders();

      // Start GPS only after backend confirms
      // the delivery has started.
      startLocationTracking(orderId);
    } catch (err) {
      console.error(
        "Start delivery error:",
        err
      );

      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to start delivery."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // GPS TRACKING
  // =========================================================

  const startLocationTracking = (
    orderId
  ) => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    // Already tracking this order
    if (
      watchRefs.current[orderId] !==
      undefined
    ) {
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          const {
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
          } = position.coords;

          try {
            await api.post(
              "/delivery/location",
              {
                orderId,
                latitude,
                longitude,
                accuracy:
                  accuracy ?? null,
                speed:
                  speed ?? null,
                heading:
                  heading ?? null,
              }
            );

            console.log(
              "GPS location sent:",
              {
                orderId,
                latitude,
                longitude,
              }
            );
          } catch (err) {
            console.error(
              "GPS update failed:",
              err
            );
          }
        },
        (err) => {
          console.error(
            "GPS error:",
            err
          );

          if (err.code === 1) {
            alert(
              "Location permission denied. Please allow location access for delivery tracking."
            );
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );

    watchRefs.current[orderId] =
      watchId;
  };

  // =========================================================
  // STOP GPS TRACKING
  // =========================================================

  const stopLocationTracking = (
    orderId
  ) => {
    const watchId =
      watchRefs.current[orderId];

    if (watchId !== undefined) {
      navigator.geolocation.clearWatch(
        watchId
      );

      delete watchRefs.current[
        orderId
      ];
    }
  };

  // =========================================================
  // NAVIGATE TO CUSTOMER
  // =========================================================

  const handleNavigateToCustomer = (
    item
  ) => {
    const latitude = Number(
      item.latitude
    );

    const longitude = Number(
      item.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      alert(
        "Customer location coordinates are not available."
      );

      return;
    }

    const googleMapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${latitude},${longitude}`;

    window.open(
      googleMapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // OPEN VERIFICATION MODAL
  // =========================================================

  const handleComplete = (
    assignmentId,
    orderId
  ) => {
    setVerificationModal({
      assignmentId,
      orderId,
    });

    setVerificationCode("");
  };

  // =========================================================
  // VERIFY CODE + COMPLETE DELIVERY
  // =========================================================

  const submitVerificationCode =
    async () => {
      const code =
        verificationCode.trim();

      if (!code) {
        alert(
          "Please enter the customer's verification code."
        );

        return;
      }

      if (!/^\d{6}$/.test(code)) {
        alert(
          "Please enter a valid 6-digit verification code."
        );

        return;
      }

      if (!verificationModal) {
        return;
      }

      const {
        assignmentId,
        orderId,
      } = verificationModal;

      try {
        setActionLoading(
          assignmentId
        );

        await api.post(
          "/delivery/complete",
          {
            assignmentId,
            verificationCode: code,
          }
        );

        // Stop GPS after successful completion
        stopLocationTracking(
          orderId
        );

        setVerificationModal(null);
        setVerificationCode("");

        await fetchOrders();

        alert(
          "Delivery completed successfully."
        );
      } catch (err) {
        console.error(
          "Complete delivery error:",
          err
        );

        alert(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Invalid verification code."
        );
      } finally {
        setActionLoading(null);
      }
    };

  // =========================================================
  // START GPS FOR EXISTING OUT-FOR-DELIVERY ORDERS
  // =========================================================

  useEffect(() => {
    orders.forEach((item) => {
      const status =
        item.assignmentStatus ||
        item.deliveryStatus ||
        item.status;

      if (
        status ===
          "out_for_delivery" &&
        item.orderId &&
        watchRefs.current[
          item.orderId
        ] === undefined
      ) {
        startLocationTracking(
          item.orderId
        );
      }
    });
  }, [orders]);

  // =========================================================
  // CLEANUP GPS
  // =========================================================

  useEffect(() => {
    return () => {
      Object.values(
        watchRefs.current
      ).forEach((watchId) => {
        navigator.geolocation.clearWatch(
          watchId
        );
      });

      watchRefs.current = {};
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      await api.post(
        "/delivery/logout"
      );
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );
    }

    navigate("/login");
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (
    status
  ) => {
    switch (status) {
      case "assigned":
        return "Assigned";

      case "accepted":
        return "Accepted";

      case "out_for_delivery":
        return "Out for Delivery";

      case "completed":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return status || "Unknown";
    }
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "assigned":
        return "status-assigned";

      case "accepted":
        return "status-accepted";

      case "out_for_delivery":
        return "status-out";

      case "completed":
        return "status-completed";

      case "cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="delivery-loading">
          Loading delivery orders...
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="delivery-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="delivery-header">

        <div>
          <h1>
            Delivery Orders
          </h1>

          <p>
            Manage your assigned deliveries
          </p>
        </div>

        <button
          className="delivery-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="delivery-error">
          {error}
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!error &&
        orders.length === 0 && (
          <div className="delivery-empty">

            <div className="empty-icon">
              📦
            </div>

            <h2>
              No Delivery Orders
            </h2>

            <p>
              You currently have no orders
              assigned to you.
            </p>

          </div>
        )}

      {/* =====================================================
          ORDERS
      ===================================================== */}

      <div className="delivery-orders-grid">

        {orders.map((item) => {

          const assignmentId =
            item.id ||
            item.assignmentId;

          const orderId =
            item.orderId;

          const status =
            item.assignmentStatus ||
            item.deliveryStatus ||
            item.status;

          const isLoading =
            actionLoading ===
            assignmentId;

          return (
            <div
              className="delivery-order-card"
              key={assignmentId}
            >

              {/* =============================================
                  TOP
              ============================================= */}

              <div className="delivery-card-top">

                <div>

                  <span className="order-label">
                    Order
                  </span>

                  <h2>
                    #{orderId}
                  </h2>

                </div>

                <span
                  className={`delivery-status ${getStatusClass(
                    status
                  )}`}
                >
                  {getStatusLabel(
                    status
                  )}
                </span>

              </div>

              {/* =============================================
                  CUSTOMER
              ============================================= */}

              <div className="delivery-section">

                <h3>
                  Customer
                </h3>

                <div className="delivery-info-row">

                  <span>
                    👤
                  </span>

                  <div>

                    <strong>
                      {item.fullName ||
                        item.customerName ||
                        "Customer"}
                    </strong>

                  </div>

                </div>

                {(item.mobile ||
                  item.customerMobile) && (
                  <div className="delivery-info-row">

                    <span>
                      📞
                    </span>

                    <a
                      href={`tel:${
                        item.mobile ||
                        item.customerMobile
                      }`}
                    >
                      {item.mobile ||
                        item.customerMobile}
                    </a>

                  </div>
                )}

              </div>

              {/* =============================================
                  ADDRESS
              ============================================= */}

              <div className="delivery-section">

                <h3>
                  Delivery Address
                </h3>

                <div className="delivery-address">

                  {item.houseNo && (
                    <div>
                      {item.houseNo}
                    </div>
                  )}

                  {item.addressLine1 && (
                    <div>
                      {item.addressLine1}
                    </div>
                  )}

                  {item.addressLine2 && (
                    <div>
                      {item.addressLine2}
                    </div>
                  )}

                  {item.landmark && (
                    <div>
                      Landmark:{" "}
                      {item.landmark}
                    </div>
                  )}

                  <div>
                    {item.city}

                    {item.state
                      ? `, ${item.state}`
                      : ""}

                    {item.pincode
                      ? ` - ${item.pincode}`
                      : ""}
                  </div>

                </div>

                {/* EXACT CUSTOMER COORDINATES */}

                {item.latitude != null &&
                  item.longitude != null && (
                    <div className="delivery-coordinates">

                      📍{" "}
                      {Number(
                        item.latitude
                      ).toFixed(6)}

                      ,{" "}

                      {Number(
                        item.longitude
                      ).toFixed(6)}

                    </div>
                  )}

                {/* NAVIGATE */}

                {item.latitude != null &&
                  item.longitude != null && (
                    <button
                      type="button"
                      className="delivery-navigate-btn"
                      onClick={() =>
                        handleNavigateToCustomer(
                          item
                        )
                      }
                    >
                      🧭 Navigate to Customer
                    </button>
                  )}

              </div>

              {/* =============================================
                  ORDER INFO
              ============================================= */}

              <div className="delivery-section">

                <h3>
                  Order Details
                </h3>

                <div className="delivery-details-grid">

                  <div>

                    <span>
                      Order Date
                    </span>

                    <strong>
                      {item.orderDate
                        ? new Date(
                            item.orderDate
                          ).toLocaleString()
                        : "-"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {Number(
                        item.totalCost ||
                          0
                      ).toFixed(2)}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Payment
                    </span>

                    <strong>
                      {item.paymentMethod ||
                        "-"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Payment Status
                    </span>

                    <strong>
                      {item.paymentStatus ||
                        "-"}
                    </strong>

                  </div>

                </div>

              </div>

              {/* =============================================
                  ACTIONS
              ============================================= */}

              <div className="delivery-actions">

                {/* ASSIGNED */}

                {status ===
                  "assigned" && (
                  <button
                    className="delivery-action primary"
                    disabled={isLoading}
                    onClick={() =>
                      handleAccept(
                        assignmentId
                      )
                    }
                  >
                    {isLoading
                      ? "Please wait..."
                      : "Accept Delivery"}
                  </button>
                )}

                {/* ACCEPTED */}

                {status ===
                  "accepted" && (
                  <button
                    className="delivery-action primary"
                    disabled={isLoading}
                    onClick={() =>
                      handleStartDelivery(
                        assignmentId,
                        orderId
                      )
                    }
                  >
                    {isLoading
                      ? "Starting..."
                      : "Start Delivery"}
                  </button>
                )}

                {/* OUT FOR DELIVERY */}

                {status ===
                  "out_for_delivery" && (
                  <>
                    <button
                      className="delivery-action tracking"
                      onClick={() =>
                        navigate(
                          `/orders/${orderId}/track`
                        )
                      }
                    >
                      🗺️ View Tracking
                    </button>

                    <button
                      className="delivery-action complete"
                      disabled={isLoading}
                      onClick={() =>
                        handleComplete(
                          assignmentId,
                          orderId
                        )
                      }
                    >
                      {isLoading
                        ? "Completing..."
                        : "Mark Delivered"}
                    </button>
                  </>
                )}

                {/* COMPLETED */}

                {status ===
                  "completed" && (
                  <div className="delivery-completed">
                    ✓ Delivery Completed
                  </div>
                )}

                {/* CANCELLED */}

                {status ===
                  "cancelled" && (
                  <div className="delivery-cancelled">
                    Delivery Cancelled
                  </div>
                )}

              </div>

            </div>
          );
        })}

      </div>

      {/* =====================================================
          DELIVERY VERIFICATION MODAL
      ===================================================== */}

      {verificationModal && (
        <div className="delivery-verification-overlay">

          <div className="delivery-verification-modal">

            <div className="verification-modal-icon">
              🔐
            </div>

            <h2>
              Verify Delivery
            </h2>

            <p className="verification-modal-order">
              Order #
              {
                verificationModal.orderId
              }
            </p>

            <p className="verification-modal-text">
              Ask the customer for the{" "}
              <strong>
                6-digit delivery
                verification code
              </strong>{" "}
              before completing this
              delivery.
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={
                verificationCode
              }
              onChange={(e) =>
                setVerificationCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="Enter 6-digit code"
              className="delivery-verification-input"
              autoFocus
            />

            <div className="verification-modal-actions">

              <button
                type="button"
                className="verification-cancel-btn"
                disabled={
                  actionLoading ===
                  verificationModal.assignmentId
                }
                onClick={() => {
                  setVerificationModal(
                    null
                  );

                  setVerificationCode(
                    ""
                  );
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="verification-confirm-btn"
                disabled={
                  actionLoading ===
                    verificationModal.assignmentId ||
                  verificationCode.length !==
                    6
                }
                onClick={
                  submitVerificationCode
                }
              >
                {actionLoading ===
                verificationModal.assignmentId
                  ? "Verifying..."
                  : "Verify & Complete"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
