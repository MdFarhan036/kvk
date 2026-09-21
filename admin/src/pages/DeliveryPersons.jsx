import React, { useEffect, useState } from "react";
import "./DeliveryPersons.css";
import api from "./api";

export default function DeliveryPersons() {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  // =========================================================
  // FETCH DELIVERY PERSONS
  // =========================================================

  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/delivery/persons");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.deliveryPersons ||
          res.data?.persons ||
          [];

      setDeliveryPersons(data);
    } catch (err) {
      console.error("Fetch delivery persons error:", err);

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
  // INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // CREATE DELIVERY PERSON
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter delivery person's name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter email address.");
      return;
    }

    if (!form.mobile.trim()) {
      setError("Please enter mobile number.");
      return;
    }

    if (!form.password) {
      setError("Please enter password.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/delivery/persons", {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      });

      setSuccess(
        "Delivery person created successfully."
      );

      setForm({
        name: "",
        email: "",
        mobile: "",
        password: "",
      });

      await fetchDeliveryPersons();
    } catch (err) {
      console.error("Create delivery person error:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create delivery person."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery person?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      setError("");
      setSuccess("");

      await api.delete(`/delivery/persons/${id}`);

      setSuccess(
        "Delivery person deleted successfully."
      );

      await fetchDeliveryPersons();
    } catch (err) {
      console.error("Delete delivery person error:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete delivery person."
      );
    } finally {
      setDeleting(null);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="delivery-persons-page">

      <div className="delivery-persons-header">
        <div>
          <h1>Delivery Persons</h1>
          <p>
            Manage KVK delivery personnel and their accounts.
          </p>
        </div>
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div className="delivery-persons-error">
          {error}
        </div>
      )}

      {success && (
        <div className="delivery-persons-success">
          {success}
        </div>
      )}

      {/* =====================================================
          CREATE FORM
      ===================================================== */}

      <div className="delivery-persons-form-card">

        <h2>Add Delivery Person</h2>

        <form onSubmit={handleSubmit}>

          <div className="delivery-form-grid">

            <div className="delivery-form-group">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                disabled={saving}
              />
            </div>

            <div className="delivery-form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                disabled={saving}
              />
            </div>

            <div className="delivery-form-group">
              <label>Mobile</label>

              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                disabled={saving}
              />
            </div>

            <div className="delivery-form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create login password"
                disabled={saving}
              />
            </div>

          </div>

          <button
            type="submit"
            className="delivery-create-btn"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Delivery Person"}
          </button>

        </form>
      </div>

      {/* =====================================================
          LIST
      ===================================================== */}

      <div className="delivery-persons-list-card">

        <div className="delivery-list-header">
          <h2>Delivery Personnel</h2>

          <button
            type="button"
            className="delivery-refresh-btn"
            onClick={fetchDeliveryPersons}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="delivery-list-loading">
            Loading delivery persons...
          </div>
        ) : deliveryPersons.length === 0 ? (
          <div className="delivery-list-empty">
            No delivery persons found.
          </div>
        ) : (
          <div className="delivery-table-wrapper">

            <table className="delivery-persons-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {deliveryPersons.map((person) => (
                  <tr key={person.id}>

                    <td>
                      #{person.id}
                    </td>

                    <td>
                      <strong>
                        {person.name || "-"}
                      </strong>
                    </td>

                    <td>
                      {person.email || "-"}
                    </td>

                    <td>
                      {person.mobile || "-"}
                    </td>

                    <td>
                      <span className="delivery-role-badge">
                        Delivery
                      </span>
                    </td>

                    <td>
                      {person.createdAt
                        ? new Date(
                            person.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="delivery-delete-btn"
                        disabled={
                          deleting === person.id
                        }
                        onClick={() =>
                          handleDelete(person.id)
                        }
                      >
                        {deleting === person.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}