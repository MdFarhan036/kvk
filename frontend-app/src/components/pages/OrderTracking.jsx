import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import api from "../api.js";

import "./OrderTracking.css";

// =====================================================
// FIX LEAFLET DEFAULT MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =====================================================
// DELIVERY ICON
// =====================================================

const deliveryIcon = new L.DivIcon({
  className: "delivery-marker-wrapper",
  html: `
    <div class="delivery-marker">
      🚚
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
});

// =====================================================
// CUSTOMER DESTINATION ICON
// =====================================================

const destinationIcon = new L.DivIcon({
  className: "destination-marker-wrapper",
  html: `
    <div class="destination-marker">
      📍
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

// =====================================================
// MAP AUTO FIT
// =====================================================

const TrackingMapController = ({
  deliveryPosition,
  destinationPosition,
}) => {
  const map = useMap();

  useEffect(() => {
    const positions = [];

    if (
      Array.isArray(deliveryPosition) &&
      deliveryPosition.length === 2
    ) {
      positions.push(deliveryPosition);
    }

    if (
      Array.isArray(destinationPosition) &&
      destinationPosition.length === 2
    ) {
      positions.push(destinationPosition);
    }

    if (positions.length === 0) {
      return;
    }

    if (positions.length === 1) {
      map.setView(
        positions[0],
        15,
        {
          animate: true,
        }
      );

      return;
    }

    const bounds = L.latLngBounds(
      positions
    );

    map.fitBounds(
      bounds,
      {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
      }
    );
  }, [
    map,
    deliveryPosition,
    destinationPosition,
  ]);

  return null;
};

// =====================================================
// COMPONENT
// =====================================================

export const OrderTracking = () => {
  const navigate = useNavigate();

  const { orderId } = useParams();

  const [trackingData, setTrackingData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  // =====================================================
  // FETCH TRACKING
  // =====================================================

  const fetchTracking = useCallback(
    async (showLoader = false) => {
      if (!orderId) {
        setErrorMsg(
          "Invalid order ID."
        );

        setLoading(false);

        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        setErrorMsg("");

        const { data } =
          await api.get(
            `/delivery/tracking/${encodeURIComponent(
              orderId
            )}`
          );

        setTrackingData(data);

        setLastUpdated(
          new Date()
        );
      } catch (err) {
        console.error(
          "❌ Failed to fetch order tracking:",
          err
        );

        const status =
          err?.response?.status;

        if (status === 401) {
          setErrorMsg(
            "Please login to track this order."
          );
        } else if (status === 403) {
          setErrorMsg(
            "You are not authorized to track this order."
          );
        } else if (status === 404) {
          setErrorMsg(
            "Order tracking information was not found."
          );
        } else {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              "Unable to load tracking information."
          );
        }
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [orderId]
  );

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchTracking(true);
  }, [fetchTracking]);

  // =====================================================
  // LIVE POLLING
  // =====================================================

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const interval =
      setInterval(() => {
        fetchTracking(false);
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    orderId,
    fetchTracking,
  ]);

  // =====================================================
  // NORMALIZE RESPONSE
  // =====================================================

  const normalized = useMemo(() => {
    if (!trackingData) {
      return {
        order: null,
        assignment: null,
        destination: null,
        currentLocation: null,
      };
    }

    return {
      order:
        trackingData.order ||
        trackingData.data?.order ||
        null,

      assignment:
        trackingData.assignment ||
        trackingData.data?.assignment ||
        null,

      destination:
        trackingData.destination ||
        trackingData.orderAddress ||
        trackingData.data?.destination ||
        trackingData.data?.orderAddress ||
        null,

      currentLocation:
        trackingData.currentLocation ||
        trackingData.latestLocation ||
        trackingData.deliveryLocation ||
        trackingData.data?.currentLocation ||
        trackingData.data?.latestLocation ||
        null,
    };
  }, [trackingData]);

  // =====================================================
  // DATA
  // =====================================================

  const order =
    normalized.order;

  const assignment =
    normalized.assignment;

  const destination =
    normalized.destination;

  const currentLocation =
    normalized.currentLocation;

  // =====================================================
  // COORDINATES
  // =====================================================

  const destinationPosition =
    destination?.latitude != null &&
    destination?.longitude != null
      ? [
          Number(destination.latitude),
          Number(destination.longitude),
        ]
      : null;

  const deliveryPosition =
    currentLocation?.latitude != null &&
    currentLocation?.longitude != null
      ? [
          Number(currentLocation.latitude),
          Number(currentLocation.longitude),
        ]
      : null;

  const mapCenter =
    deliveryPosition ||
    destinationPosition ||
    [26.9124, 75.7873];

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDateTime = (
    value
  ) => {
    if (!value) {
      return "N/A";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "N/A";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // STATUS
  // =====================================================

  const orderStatus =
    String(
      order?.status ||
        "Pending"
    );

  const assignmentStatus =
    String(
      assignment?.status ||
        ""
    );

  const normalizedAssignmentStatus =
    assignmentStatus.toLowerCase();

  // =====================================================
  // DELIVERY PERSON
  // =====================================================

  const deliveryPerson =
    assignment?.deliveryPerson ||
    assignment?.delivery_person ||
    null;

  // =====================================================
  // DELIVERY MESSAGE
  // =====================================================

  const getTrackingMessage =
    () => {
      if (
        orderStatus.toLowerCase() ===
        "cancelled"
      ) {
        return "This order has been cancelled.";
      }

      if (
        orderStatus.toLowerCase() ===
        "delivered"
      ) {
        return "Your order has been delivered.";
      }

      if (!assignment) {
        return "Your order has not been assigned to a delivery person yet.";
      }

      if (
        normalizedAssignmentStatus ===
        "assigned"
      ) {
        return "A delivery person has been assigned to your order.";
      }

      if (
        normalizedAssignmentStatus ===
        "accepted"
      ) {
        return "Your delivery person has accepted the order.";
      }

      if (
        normalizedAssignmentStatus ===
        "out_for_delivery"
      ) {
        if (deliveryPosition) {
          return "Your order is on the way.";
        }

        return "Your order is out for delivery. Waiting for the latest GPS location.";
      }

      if (
        normalizedAssignmentStatus ===
        "completed"
      ) {
        return "Delivery completed.";
      }

      return "Your order is being processed.";
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="order-tracking-container">
        <div className="tracking-loading">
          <div className="tracking-spinner" />

          <h2>
            Loading live tracking...
          </h2>

          <p>
            Please wait while we fetch
            your order location.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (errorMsg) {
    return (
      <div className="order-tracking-container">
        <div className="tracking-error">
          <h2>
            Unable to Track Order
          </h2>

          <p>
            {errorMsg}
          </p>

          <div className="tracking-error-actions">
            <button
              type="button"
              onClick={() =>
                fetchTracking(true)
              }
            >
              Try Again
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() =>
                navigate("/orders")
              }
            >
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="order-tracking-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="tracking-header">

        <div>
          <button
            type="button"
            className="tracking-back-btn"
            onClick={() =>
              navigate("/orders")
            }
          >
            ← Back to My Orders
          </button>

          <h1>
            Track Your Order
          </h1>

          <p className="order-tracking-subtitle">
            Live delivery tracking for
            order #
            {order?.id || orderId}
          </p>
        </div>

        <div className="live-indicator">
          <span className="live-dot" />
          Live Tracking
        </div>

      </div>

      {/* =================================================
          STATUS
      ================================================= */}

      <div className="tracking-status-card">

        <div>
          <span>
            Order Status
          </span>

          <strong
            className={`tracking-order-status tracking-status-${orderStatus
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {orderStatus}
          </strong>
        </div>

        <div>
          <span>
            Delivery Status
          </span>

          <strong>
            {assignmentStatus
              ? assignmentStatus
                  .replace(/_/g, " ")
                  .replace(
                    /\b\w/g,
                    (char) =>
                      char.toUpperCase()
                  )
              : "Not Assigned"}
          </strong>
        </div>

        <div>
          <span>
            Last Updated
          </span>

          <strong>
            {lastUpdated
              ? formatDateTime(
                  lastUpdated
                )
              : "Updating..."}
          </strong>
        </div>

      </div>

      {/* =================================================
          TRACKING MESSAGE
      ================================================= */}

      <div className="tracking-message">
        <span className="tracking-message-icon">
          {deliveryPosition
            ? "🚚"
            : "📦"}
        </span>

        <div>
          <strong>
            {getTrackingMessage()}
          </strong>

          <p>
            Location automatically updates
            every 5 seconds.
          </p>
        </div>
      </div>

      {/* =================================================
          DELIVERY PERSON
      ================================================= */}

      {deliveryPerson && (
        <div className="delivery-person-card">

          <div className="delivery-person-icon">
            🚚
          </div>

          <div>
            <span>
              Delivery Partner
            </span>

            <strong>
              {deliveryPerson.name ||
                deliveryPerson.fullName ||
                "Delivery Partner"}
            </strong>

            {deliveryPerson.mobile && (
              <small>
                Mobile:{" "}
                {deliveryPerson.mobile}
              </small>
            )}
          </div>

        </div>
      )}

      {/* =================================================
          MAP
      ================================================= */}

      <div className="tracking-map-section">

        <div className="tracking-map-header">

          <div>
            <h2>
              Live Location
            </h2>

            <p>
              🚚 Delivery partner
              &nbsp;&nbsp; 📍 Delivery destination
            </p>
          </div>

          {currentLocation?.accuracy != null && (
            <span className="gps-accuracy">
              GPS accuracy:{" "}
              {Number(
                currentLocation.accuracy
              ).toFixed(0)}
              m
            </span>
          )}

        </div>

        {destinationPosition ||
        deliveryPosition ? (

          <div className="tracking-map">

            <MapContainer
              center={mapCenter}
              zoom={14}
              scrollWheelZoom={true}
              style={{
                height: "100%",
                width: "100%",
              }}
            >

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <TrackingMapController
                deliveryPosition={
                  deliveryPosition
                }
                destinationPosition={
                  destinationPosition
                }
              />

              {/* DELIVERY PERSON */}

              {deliveryPosition && (
                <Marker
                  position={
                    deliveryPosition
                  }
                  icon={deliveryIcon}
                >
                  <Popup>
                    <strong>
                      🚚 Delivery Partner
                    </strong>

                    <br />

                    Current GPS location

                    {currentLocation?.accuracy != null && (
                      <>
                        <br />
                        Accuracy:{" "}
                        {Number(
                          currentLocation.accuracy
                        ).toFixed(0)}
                        m
                      </>
                    )}

                    {currentLocation?.recordedAt && (
                      <>
                        <br />
                        Updated:{" "}
                        {formatDateTime(
                          currentLocation.recordedAt
                        )}
                      </>
                    )}
                  </Popup>
                </Marker>
              )}

              {/* DESTINATION */}

              {destinationPosition && (
                <Marker
                  position={
                    destinationPosition
                  }
                  icon={
                    destinationIcon
                  }
                >
                  <Popup>
                    <strong>
                      📍 Delivery Address
                    </strong>

                    <br />

                    {destination?.fullName && (
                      <>
                        {destination.fullName}
                        <br />
                      </>
                    )}

                    {destination?.houseNo && (
                      <>
                        {destination.houseNo}
                        <br />
                      </>
                    )}

                    {destination?.addressLine1 && (
                      <>
                        {
                          destination.addressLine1
                        }
                        <br />
                      </>
                    )}

                    {destination?.addressLine2 && (
                      <>
                        {
                          destination.addressLine2
                        }
                        <br />
                      </>
                    )}

                    {destination?.city && (
                      <>
                        {destination.city}
                        {destination?.pincode
                          ? ` - ${destination.pincode}`
                          : ""}
                      </>
                    )}
                  </Popup>
                </Marker>
              )}

            </MapContainer>

          </div>

        ) : (

          <div className="no-location-map">
            <div>
              📍
            </div>

            <h3>
              Location Not Available
            </h3>

            <p>
              GPS coordinates are not
              available for this order yet.
            </p>

            <p>
              The map will appear once
              location information is available.
            </p>
          </div>

        )}

      </div>

      {/* =================================================
          DELIVERY ADDRESS
      ================================================= */}

      {destination && (
        <div className="tracking-address-card">

          <h2>
            Delivery Address
          </h2>

          <p>
            <strong>
              {destination.fullName ||
                "Customer"}
            </strong>

            <br />

            {destination.houseNo && (
              <>
                {destination.houseNo}
                <br />
              </>
            )}

            {destination.addressLine1 && (
              <>
                {
                  destination.addressLine1
                }
                <br />
              </>
            )}

            {destination.addressLine2 && (
              <>
                {
                  destination.addressLine2
                }
                <br />
              </>
            )}

            {destination.landmark && (
              <>
                Landmark:{" "}
                {destination.landmark}
                <br />
              </>
            )}

            {destination.city && (
              <>
                {destination.city}
                {destination.pincode
                  ? ` - ${destination.pincode}`
                  : ""}
                <br />
              </>
            )}

            {destination.state && (
              <>
                {destination.state}
                {destination.country
                  ? `, ${destination.country}`
                  : ""}
              </>
            )}
          </p>

          {destinationPosition && (
            <div className="tracking-coordinates">
              <span>
                Latitude
              </span>

              <strong>
                {destinationPosition[0].toFixed(
                  6
                )}
              </strong>

              <span>
                Longitude
              </span>

              <strong>
                {destinationPosition[1].toFixed(
                  6
                )}
              </strong>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default OrderTracking;
