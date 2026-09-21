import { useState } from "react";
import axios from "axios";
import "./ChangePassword.css"
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!form.newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `${API_BASE_URL}/auth/customer/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          withCredentials: true,
        }
      );

      setMessage(
        response?.data?.message ||
          "Password changed successfully."
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Change password error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">

      <div className="account-page-header">
        <h2>Change Password</h2>
        <p>
          Update your password to keep your account secure.
        </p>
      </div>

      <form
        className="change-password-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">
          <label htmlFor="currentPassword">
            Current Password
          </label>

          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">
            New Password
          </label>

          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            Confirm New Password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {message && (
          <div className="form-success">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

      </form>

    </div>
  );
};

export default ChangePassword;