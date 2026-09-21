import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./DeliveryOrderTracking.css";

export default function DeliveryOrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTracking = async () => {
    try {
      const response = await api.get(
        `/delivery/tracking/${orderId}`
      );

      setTracking(response.data);
      setError("");
    } catch (err) {
      console.error("Delivery tracking error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load tracking information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();

    const interval = setInterval(fetchTracking, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="delivery-tracking-page">
        <div className="delivery-tracking-loading">
          Loading tracking...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delivery-tracking-page">
        <div className="delivery-tracking-error">
          {error}
        </div>

        <button
          className="tracking-back-btn"
          onClick={() => navigate("/orders")}
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

  const data = tracking?.tracking || tracking || {};

  const currentLocation =
    data.latestLocation ||
    data.deliveryLocation ||
    data.location ||
    null;

  const destination =
    data.destination ||
    data.orderAddress ||
    data.address ||
    null;

  const deliveryPerson =
    data.deliveryPerson ||
    data.delivery_person ||
    null;

  return (
    <div className="delivery-tracking-page">

      <header className="delivery-tracking-header">
        <div>
          <button
            className="tracking-back-btn"
            onClick={() => navigate("/orders")}
          >
            ← Back
          </button>

          <h1>
            Order #{orderId}
          </h1>

          <p>
            Delivery Tracking
          </p>
        </div>
      </header>

      <div className="delivery-tracking-content">

        {/* STATUS */}
        <section className="tracking-card">
          <div className="tracking-card-header">
            <h2>Delivery Status</h2>

            <span className="tracking-status">
              {data.status ||
                data.assignmentStatus ||
                data.deliveryStatus ||
                "Unknown"}
            </span>
          </div>
        </section>

        {/* DELIVERY PERSON */}
        <section className="tracking-card">

          <h2>Delivery Person</h2>

          {deliveryPerson ? (
            <div className="tracking-person">

              <div className="tracking-person-icon">
                👤
              </div>

              <div>
                <strong>
                  {deliveryPerson.name ||
                    deliveryPerson.fullName ||
                    "Delivery Person"}
                </strong>

                {(deliveryPerson.mobile ||
                  deliveryPerson.phone) && (
                  <a
                    href={`tel:${
                      deliveryPerson.mobile ||
                      deliveryPerson.phone
                    }`}
                  >
                    📞{" "}
                    {deliveryPerson.mobile ||
                      deliveryPerson.phone}
                  </a>
                )}
              </div>

            </div>
          ) : (
            <p>No delivery person information available.</p>
          )}

        </section>

        {/* CURRENT GPS */}
        <section className="tracking-card">

          <h2>Current Location</h2>

          {currentLocation ? (
            <div className="tracking-location">

              <div className="tracking-coordinate">
                <span>Latitude</span>
                <strong>
                  {Number(
                    currentLocation.latitude
                  ).toFixed(6)}
                </strong>
              </div>

              <div className="tracking-coordinate">
                <span>Longitude</span>
                <strong>
                  {Number(
                    currentLocation.longitude
                  ).toFixed(6)}
                </strong>
              </div>

              {currentLocation.accuracy != null && (
                <div className="tracking-coordinate">
                  <span>Accuracy</span>
                  <strong>
                    {Number(
                      currentLocation.accuracy
                    ).toFixed(1)}{" "}
                    m
                  </strong>
                </div>
              )}

              {currentLocation.recordedAt && (
                <div className="tracking-coordinate">
                  <span>Last Updated</span>
                  <strong>
                    {new Date(
                      currentLocation.recordedAt
                    ).toLocaleString()}
                  </strong>
                </div>
              )}

            </div>
          ) : (
            <div className="tracking-no-location">
              📍 Delivery person's live location
              is not available yet.
            </div>
          )}

        </section>

        {/* DESTINATION */}
        <section className="tracking-card">

          <h2>Delivery Destination</h2>

          {destination ? (
            <div className="tracking-address">

              {destination.houseNo && (
                <div>{destination.houseNo}</div>
              )}

              {destination.addressLine1 && (
                <div>
                  {destination.addressLine1}
                </div>
              )}

              {destination.addressLine2 && (
                <div>
                  {destination.addressLine2}
                </div>
              )}

              {destination.landmark && (
                <div>
                  Landmark: {destination.landmark}
                </div>
              )}

              <div>
                {destination.city || ""}
                {destination.state
                  ? `, ${destination.state}`
                  : ""}
                {destination.pincode
                  ? ` - ${destination.pincode}`
                  : ""}
              </div>

              {destination.latitude != null &&
                destination.longitude != null && (
                  <div className="tracking-destination-coordinates">
                    📍{" "}
                    {Number(
                      destination.latitude
                    ).toFixed(6)}
                    ,{" "}
                    {Number(
                      destination.longitude
                    ).toFixed(6)}
                  </div>
                )}

            </div>
          ) : (
            <p>
              Destination information unavailable.
            </p>
          )}

        </section>

      </div>

    </div>
  );
}