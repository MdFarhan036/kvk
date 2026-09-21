import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api";

import "./AdminTrackOrders.css";

// =====================================================
// LEAFLET DEFAULT ICON
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
// DELIVERY PERSON ICON
// =====================================================

const deliveryIcon = new L.DivIcon({
  className: "admin-delivery-marker-wrapper",

  html: `
    <div class="admin-delivery-marker">
      🚚
    </div>
  `,

  iconSize: [46, 46],
  iconAnchor: [23, 23],
  popupAnchor: [0, -23],
});

// =====================================================
// CUSTOMER DESTINATION ICON
// =====================================================

const destinationIcon = new L.DivIcon({
  className: "admin-destination-marker-wrapper",

  html: `
    <div class="admin-destination-marker">
      📍
    </div>
  `,

  iconSize: [46, 46],
  iconAnchor: [23, 46],
  popupAnchor: [0, -46],
});

// =====================================================
// MAP CONTROLLER
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
      positions.push(
        deliveryPosition
      );
    }

    if (
      Array.isArray(destinationPosition) &&
      destinationPosition.length === 2
    ) {
      positions.push(
        destinationPosition
      );
    }

    if (
      positions.length === 0
    ) {
      return;
    }

    if (
      positions.length === 1
    ) {
      map.setView(
        positions[0],
        15,
        {
          animate: true,
        }
      );

      return;
    }

    const bounds =
      L.latLngBounds(
        positions
      );

    map.fitBounds(
      bounds,
      {
        padding: [60, 60],
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

export const AdminTrackOrders = () => {
  const navigate =
    useNavigate();

  const { orderId } =
    useParams();

  const [trackingData, setTrackingData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  // =====================================================
  // FETCH TRACKING
  // =====================================================

  const fetchTracking =
    useCallback(
      async (showLoader = false) => {
        if (!orderId) {
          setError(
            "Invalid order ID."
          );

          setLoading(false);

          return;
        }

        try {
          if (showLoader) {
            setLoading(true);
          }

          setError("");

          const res =
            await api.get(
              `/delivery/tracking/${encodeURIComponent(
                orderId
              )}`
            );

          setTrackingData(
            res.data
          );

          setLastUpdated(
            new Date()
          );
        } catch (err) {
          console.error(
            "❌ Failed to fetch tracking:",
            err
          );

          const status =
            err?.response?.status;

          if (status === 401) {
            setError(
              "Admin authentication required."
            );
          } else if (
            status === 403
          ) {
            setError(
              "You are not authorized to view this tracking information."
            );
          } else if (
            status === 404
          ) {
            setError(
              "Order tracking information was not found."
            );
          } else {
            setError(
              err?.response?.data
                ?.message ||
                err?.response?.data
                  ?.error ||
                "Failed to load tracking information."
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

  const normalized =
    useMemo(() => {
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

  const order =
    normalized.order;

  const assignment =
    normalized.assignment;

  const destination =
    normalized.destination;

  const currentLocation =
    normalized.currentLocation;

  // =====================================================
  // POSITIONS
  // =====================================================

  const destinationPosition =
    destination?.latitude != null &&
    destination?.longitude != null
      ? [
          Number(
            destination.latitude
          ),
          Number(
            destination.longitude
          ),
        ]
      : null;

  const deliveryPosition =
    currentLocation?.latitude != null &&
    currentLocation?.longitude != null
      ? [
          Number(
            currentLocation.latitude
          ),
          Number(
            currentLocation.longitude
          ),
        ]
      : null;

  const mapCenter =
    deliveryPosition ||
    destinationPosition ||
    [26.9124, 75.7873];

  // =====================================================
  // DELIVERY PERSON
  // =====================================================

  const deliveryPerson =
    assignment?.deliveryPerson ||
    assignment?.delivery_person ||
    null;

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
        "Not Assigned"
    );

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDateTime =
    (value) => {
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
  // PRICE
  // =====================================================

  const formatPrice =
    (value) => {
      return `₹${Number(
        value || 0
      ).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-track-orders">
        <div className="admin-tracking-loading">

          <div className="admin-tracking-spinner" />

          <h2>
            Loading live tracking...
          </h2>

          <p>
            Fetching delivery location.
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="admin-track-orders">

        <div className="admin-tracking-error">

          <h2>
            Tracking Unavailable
          </h2>

          <p>
            {error}
          </p>

          <div className="admin-tracking-error-actions">

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
                navigate(
                  `/allorders/${orderId}/details`
                )
              }
            >
              Back to Order
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
    <div className="admin-track-orders">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-tracking-header">

        <div>

          <button
            type="button"
            className="admin-tracking-back"
            onClick={() =>
              navigate(
                `/allorders/${orderId}/details`
              )
            }
          >
            ← Back to Order
          </button>

          <h1>
            Live Order Tracking
          </h1>

          <p>
            Order #
            {order?.id ||
              orderId}
          </p>

        </div>

        <div className="admin-live-indicator">
          <span />
          LIVE
        </div>

      </div>

      {/* =================================================
          ORDER SUMMARY
      ================================================= */}

      <div className="admin-tracking-summary">

        <div className="admin-tracking-summary-card">
          <span>
            Order ID
          </span>

          <strong>
            #
            {order?.id ||
              orderId}
          </strong>
        </div>

        <div className="admin-tracking-summary-card">
          <span>
            Order Status
          </span>

          <strong>
            {orderStatus}
          </strong>
        </div>

        <div className="admin-tracking-summary-card">
          <span>
            Delivery Status
          </span>

          <strong>
            {assignmentStatus.replace(
              /_/g,
              " "
            )}
          </strong>
        </div>

        <div className="admin-tracking-summary-card">
          <span>
            Order Total
          </span>

          <strong>
            {formatPrice(
              order?.totalCost
            )}
          </strong>
        </div>

      </div>

      {/* =================================================
          MAP
      ================================================= */}

      <div className="admin-tracking-map-section">

        <div className="admin-tracking-map-header">

          <div>
            <h2>
              Delivery Location
            </h2>

            <p>
              🚚 Delivery Person
              &nbsp;&nbsp;&nbsp;
              📍 Customer Destination
            </p>
          </div>

          <div className="admin-last-update">

            Last updated:
            <strong>
              {lastUpdated
                ? formatDateTime(
                    lastUpdated
                  )
                : "Updating..."}
            </strong>

          </div>

        </div>

        {deliveryPosition ||
        destinationPosition ? (

          <div className="admin-tracking-map">

            <MapContainer
              center={
                mapCenter
              }
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
                  icon={
                    deliveryIcon
                  }
                >

                  <Popup>

                    <strong>
                      🚚 Delivery Person
                    </strong>

                    <br />

                    {deliveryPerson?.name ||
                      "Delivery Partner"}

                    {deliveryPerson?.mobile && (
                      <>
                        <br />
                        Mobile:{" "}
                        {
                          deliveryPerson.mobile
                        }
                      </>
                    )}

                    {currentLocation?.accuracy != null && (
                      <>
                        <br />
                        GPS Accuracy:{" "}
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

              {/* CUSTOMER */}

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
                      📍 Customer Destination
                    </strong>

                    <br />

                    {destination?.fullName && (
                      <>
                        {
                          destination.fullName
                        }
                        <br />
                      </>
                    )}

                    {destination?.mobile && (
                      <>
                        Mobile:{" "}
                        {
                          destination.mobile
                        }
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

          <div className="admin-no-location">

            <div>
              📍
            </div>

            <h3>
              Location Not Available
            </h3>

            <p>
              The delivery person has
              not submitted a GPS location
              yet.
            </p>

          </div>

        )}

      </div>

      {/* =================================================
          DELIVERY PERSON DETAILS
      ================================================= */}

      <div className="admin-tracking-grid">

        <div className="admin-tracking-card">

          <h2>
            🚚 Delivery Person
          </h2>

          {deliveryPerson ? (
            <div className="admin-delivery-details">

              <div>
                <span>
                  Name
                </span>

                <strong>
                  {deliveryPerson.name ||
                    deliveryPerson.fullName ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Mobile
                </span>

                <strong>
                  {deliveryPerson.mobile ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Assignment
                </span>

                <strong>
                  {assignmentStatus.replace(
                    /_/g,
                    " "
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Assigned At
                </span>

                <strong>
                  {formatDateTime(
                    assignment?.assignedAt
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Accepted At
                </span>

                <strong>
                  {formatDateTime(
                    assignment?.acceptedAt
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Started At
                </span>

                <strong>
                  {formatDateTime(
                    assignment?.startedAt
                  )}
                </strong>
              </div>

            </div>
          ) : (
            <p className="admin-no-data">
              No delivery person assigned.
            </p>
          )}

        </div>

        {/* =================================================
            GPS DETAILS
        ================================================= */}

        <div className="admin-tracking-card">

          <h2>
            📡 GPS Information
          </h2>

          {currentLocation ? (
            <div className="admin-delivery-details">

              <div>
                <span>
                  Latitude
                </span>

                <strong>
                  {Number(
                    currentLocation.latitude
                  ).toFixed(8)}
                </strong>
              </div>

              <div>
                <span>
                  Longitude
                </span>

                <strong>
                  {Number(
                    currentLocation.longitude
                  ).toFixed(8)}
                </strong>
              </div>

              <div>
                <span>
                  Accuracy
                </span>

                <strong>
                  {currentLocation.accuracy != null
                    ? `${Number(
                        currentLocation.accuracy
                      ).toFixed(0)} m`
                    : "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Speed
                </span>

                <strong>
                  {currentLocation.speed != null
                    ? `${Number(
                        currentLocation.speed
                      ).toFixed(1)} m/s`
                    : "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Heading
                </span>

                <strong>
                  {currentLocation.heading != null
                    ? `${Number(
                        currentLocation.heading
                      ).toFixed(0)}°`
                    : "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Recorded At
                </span>

                <strong>
                  {formatDateTime(
                    currentLocation.recordedAt
                  )}
                </strong>
              </div>

            </div>
          ) : (
            <p className="admin-no-data">
              No GPS location received yet.
            </p>
          )}

        </div>

      </div>

      {/* =================================================
          CUSTOMER DETAILS
      ================================================= */}

      {destination && (
        <div className="admin-tracking-card admin-address-card">

          <h2>
            📍 Customer Delivery Address
          </h2>

          <div className="admin-address-content">

            <strong>
              {destination.fullName ||
                "Customer"}
            </strong>

            {destination.mobile && (
              <span>
                Mobile:{" "}
                {destination.mobile}
              </span>
            )}

            {destination.houseNo && (
              <span>
                {destination.houseNo}
              </span>
            )}

            {destination.addressLine1 && (
              <span>
                {
                  destination.addressLine1
                }
              </span>
            )}

            {destination.addressLine2 && (
              <span>
                {
                  destination.addressLine2
                }
              </span>
            )}

            {destination.landmark && (
              <span>
                Landmark:{" "}
                {destination.landmark}
              </span>
            )}

            <span>
              {destination.city ||
                ""}
              {destination.pincode
                ? ` - ${destination.pincode}`
                : ""}
            </span>

            <span>
              {destination.state ||
                ""}
              {destination.country
                ? `, ${destination.country}`
                : ""}
            </span>

          </div>

          {destinationPosition && (
            <div className="admin-address-coordinates">

              <span>
                Latitude
              </span>

              <strong>
                {destinationPosition[0].toFixed(
                  8
                )}
              </strong>

              <span>
                Longitude
              </span>

              <strong>
                {destinationPosition[1].toFixed(
                  8
                )}
              </strong>

            </div>
          )}

        </div>
      )}

      {/* =================================================
          ORDER DETAILS
      ================================================= */}

      <div className="admin-tracking-card">

        <h2>
          📦 Order Details
        </h2>

        <div className="admin-order-details-grid">

          <div>
            <span>
              Order ID
            </span>

            <strong>
              #{order?.id ||
                orderId}
            </strong>
          </div>

          <div>
            <span>
              Date
            </span>

            <strong>
              {formatDateTime(
                order?.orderDate
              )}
            </strong>
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              {formatPrice(
                order?.totalCost
              )}
            </strong>
          </div>

          <div>
            <span>
              Payment Method
            </span>

            <strong>
              {order?.paymentMethod ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>
              Payment Status
            </span>

            <strong>
              {order?.paymentStatus ||
                "N/A"}
            </strong>
          </div>

          <div>
            <span>
              Order Status
            </span>

            <strong>
              {orderStatus}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminTrackOrders;