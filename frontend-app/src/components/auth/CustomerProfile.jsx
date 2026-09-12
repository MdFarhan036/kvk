import { useEffect, useState } from "react";
import { useCustomerAuth } from "../../context/CustomerContext";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./CustomerProfile.css";

// 💡 Use axios instance instead of axios

export const CustomerProfile = () => {
  const { customer, logout, setCustomer } = useCustomerAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
    email: "",
  });

  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);

  // Load logged-in customer
  useEffect(() => {
    if (customer) {
      setFormData({
        customerName: customer.customerName || customer.name || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
        mobile: customer.mobile || "",
        email: customer.email || "",
      });
      setLoading(false);
    }
  }, [customer]);

  // Profile input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Password input change
  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/customers/profile`, formData);
      alert("✅ Profile updated successfully!");
      setCustomer(res.data);
    } catch (err) {
      console.error("❌ Profile update error:", err);
      alert(err.response?.data?.error || "Profile update failed");
    }
  };

  // ✅ Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return alert("All password fields are required");
    }

    if (newPassword.length < 6) {
      return alert("New password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return alert("New password and confirm password do not match");
    }

    try {
      await api.put("/customers/change-password", {
        oldPassword,
        newPassword,
      });

      alert("✅ Password updated successfully!");

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordBox(false);
    } catch (err) {
      console.error("❌ Password update error:", err);
      alert(err.response?.data?.error || "Password change failed");
    }
  };

  if (loading) return <div className="customer-profile-loading">Loading profile...</div>;

  return (
    <div className="customer-profile-page">
      <div className="customer-profile-card">
        {/* HEADER */}
        <div className="customer-profile-header">
          <div className="avatar-circle">
            {formData.customerName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="customer-profile-title">My Profile</h2>
            <p className="customer-profile-subtitle">{formData.email}</p>
          </div>
        </div>

        {/* PROFILE FORM */}
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="customer-form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} disabled />
              <small className="field-hint">Email cannot be changed</small>
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="customer-profile-actions">
            <button type="submit" className="btn primary">Save Changes</button>

            <button
              type="button"
              className="btn secondary"
              onClick={() => setShowPasswordBox(!showPasswordBox)}
            >
              {showPasswordBox ? "Cancel Password Change" : "Change Password"}
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </form>

        {/* PASSWORD CHANGE BOX */}
        {showPasswordBox && (
          <form className="password-box" onSubmit={handlePasswordSubmit}>
            <h3>Change Password</h3>

            <input
              type="password"
              name="oldPassword"
              placeholder="Current Password"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />

            <button type="submit" className="btn primary full">
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
