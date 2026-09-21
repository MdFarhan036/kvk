import { useEffect, useState } from "react";
import { useCustomerAuth } from "../../context/CustomerContext";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./CustomerProfile.css";

export const CustomerProfile = () => {
  const {
    customer,
    logout,
    setCustomer,
  } = useCustomerAuth();

  const navigate = useNavigate();

  // =====================================================
  // FORM STATE
  // =====================================================

  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD CUSTOMER
  // =====================================================

  useEffect(() => {
    if (customer) {
      setFormData({
        customerName:
          customer.customerName ||
          customer.name ||
          "",

        address:
          customer.address ||
          "",

        city:
          customer.city ||
          "",

        state:
          customer.state ||
          "",

        pincode:
          customer.pincode ||
          "",

        mobile:
          customer.mobile ||
          "",

        email:
          customer.email ||
          "",
      });

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [customer]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await api.put(
        "/customers/profile",
        {
          customerName: formData.customerName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          mobile: formData.mobile,
        }
      );

      const updatedCustomer =
        res?.data?.customer ||
        res?.data;

      if (updatedCustomer) {
        setCustomer(updatedCustomer);
      }

      alert(
        "Profile updated successfully!"
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      alert(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Profile update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="customer-profile-loading">
        Loading profile...
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="customer-profile-page">

      <div className="customer-profile-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="customer-profile-header">

          <div className="avatar-circle">
            {formData.customerName
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div>
            <h2 className="customer-profile-title">
              My Profile
            </h2>

            <p className="customer-profile-subtitle">
              {formData.email}
            </p>
          </div>

        </div>

        {/* =================================================
            PROFILE FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="customer-form"
        >

          <div className="customer-form-grid">

            {/* FULL NAME */}
            <div className="form-group">

              <label htmlFor="customerName">
                Full Name
              </label>

              <input
                id="customerName"
                type="text"
                name="customerName"
                value={
                  formData.customerName
                }
                onChange={handleChange}
                placeholder="Enter your full name"
              />

            </div>

            {/* MOBILE */}
            <div className="form-group">

              <label htmlFor="mobile">
                Mobile Number
              </label>

              <input
                id="mobile"
                type="tel"
                name="mobile"
                value={
                  formData.mobile
                }
                onChange={handleChange}
                placeholder="Enter mobile number"
              />

            </div>

            {/* EMAIL */}
            <div className="form-group full-width">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={
                  formData.email
                }
                disabled
              />

              <small className="field-hint">
                Email cannot be changed
              </small>

            </div>

            {/* ADDRESS */}
            <div className="form-group full-width">

              <label htmlFor="address">
                Address
              </label>

              <input
                id="address"
                type="text"
                name="address"
                value={
                  formData.address
                }
                onChange={handleChange}
                placeholder="Enter your address"
              />

            </div>

            {/* CITY */}
            <div className="form-group">

              <label htmlFor="city">
                City
              </label>

              <input
                id="city"
                type="text"
                name="city"
                value={
                  formData.city
                }
                onChange={handleChange}
                placeholder="Enter city"
              />

            </div>

            {/* STATE */}
            <div className="form-group">

              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                type="text"
                name="state"
                value={
                  formData.state
                }
                onChange={handleChange}
                placeholder="Enter state"
              />

            </div>

            {/* PINCODE */}
            <div className="form-group">

              <label htmlFor="pincode">
                Pincode
              </label>

              <input
                id="pincode"
                type="text"
                name="pincode"
                value={
                  formData.pincode
                }
                onChange={handleChange}
                placeholder="Enter pincode"
                maxLength={6}
              />

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="customer-profile-actions">

            <button
              type="submit"
              className="btn primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                navigate("/account/password")
              }
            >
              Change Password
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CustomerProfile;
