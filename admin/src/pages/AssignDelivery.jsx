import React, { useEffect, useState } from "react";
import "./AssignDelivery.css";
import api from "./api";

export default function AssignDelivery({
  orderId,
  currentAssignment = null,
  onAssigned,
}) {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD DELIVERY PERSONS
  // =========================================================

  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/delivery/persons");

      const persons = Array.isArray(res.data)
        ? res.data
        : res.data?.deliveryPersons ||
          res.data?.persons ||
          [];

      setDeliveryPersons(persons);
    } catch (err) {
      console.error(
        "Fetch delivery persons error:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load delivery persons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  // =========================================================
  // ASSIGN
  // =========================================================

  const handleAssign = async () => {
    if (!selectedPerson) {
      setError("Please select a delivery person.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      await api.post("/delivery/assign", {
        orderId,
        deliveryPersonId: Number(selectedPerson),
      });

      setSuccess(
        "Order assigned successfully."
      );

      if (onAssigned) {
        await onAssigned();
      }
    } catch (err) {
      console.error(
        "Assign delivery error:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to assign delivery person."
      );
    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // ALREADY ASSIGNED
  // =========================================================

  if (
    currentAssignment &&
    currentAssignment.status !== "cancelled"
  ) {
    return (
      <div className="assign-delivery-card">

        <div className="assign-delivery-header">
          <div>
            <h3>Delivery Assignment</h3>
            <p>
              This order is already assigned.
            </p>
          </div>

          <span
            className={`assignment-status ${
              currentAssignment.status
            }`}
          >
            {String(
              currentAssignment.status || ""
            )
              .replaceAll("_", " ")
              .replace(/\b\w/g, (char) =>
                char.toUpperCase()
              )}
          </span>
        </div>

        <div className="assigned-person">

          <div className="assigned-person-icon">
            🚚
          </div>

          <div>
            <strong>
              {currentAssignment.deliveryPersonName ||
                currentAssignment.name ||
                "Delivery Person"}
            </strong>

            {(currentAssignment.deliveryPersonMobile ||
              currentAssignment.mobile) && (
              <span>
                {currentAssignment.deliveryPersonMobile ||
                  currentAssignment.mobile}
              </span>
            )}

            {(currentAssignment.deliveryPersonEmail ||
              currentAssignment.email) && (
              <span>
                {currentAssignment.deliveryPersonEmail ||
                  currentAssignment.email}
              </span>
            )}
          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="assign-delivery-card">

      <div className="assign-delivery-header">
        <div>
          <h3>Assign Delivery</h3>

          <p>
            Select a delivery person for Order #
            {orderId}
          </p>
        </div>
      </div>

      {error && (
        <div className="assign-delivery-error">
          {error}
        </div>
      )}

      {success && (
        <div className="assign-delivery-success">
          {success}
        </div>
      )}

      <div className="assign-delivery-form">

        <label htmlFor="deliveryPerson">
          Delivery Person
        </label>

        <select
          id="deliveryPerson"
          value={selectedPerson}
          onChange={(e) =>
            setSelectedPerson(e.target.value)
          }
          disabled={loading || assigning}
        >
          <option value="">
            {loading
              ? "Loading delivery persons..."
              : "Select delivery person"}
          </option>

          {deliveryPersons.map((person) => (
            <option
              key={person.id}
              value={person.id}
            >
              {person.name || "Unnamed"}
              {person.mobile
                ? ` — ${person.mobile}`
                : ""}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAssign}
          disabled={
            loading ||
            assigning ||
            !selectedPerson ||
            deliveryPersons.length === 0
          }
        >
          {assigning
            ? "Assigning..."
            : "Assign Delivery"}
        </button>

      </div>

    </div>
  );
}
