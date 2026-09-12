import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export const AddCustomer = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    customerName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
    email: "",
  });

  // ============================================
  // HANDLE INPUT CHANGES
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================
  // SUBMIT CUSTOMER
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "customerName",
      "address",
      "city",
      "state",
      "pincode",
      "mobile",
      "email",
    ];

    for (const field of requiredFields) {
      if (!customer[field]) {
        return alert(`Please fill ${field}`);
      }
    }

    try {
      const response = await api.post(
        "/customers",
        customer
      );

      alert(
        `Customer created successfully!\nCustomer ID: ${response.data.id}\nGenerated Password: ${response.data.password}`
      );

      // Reset form
      setCustomer({
        customerName: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        mobile: "",
        email: "",
      });

      navigate("/customers");
    } catch (err) {
      console.error(
        "Error creating customer:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to create customer. Check console."
      );
    }
  };

  // ============================================
  // FORM
  // ============================================
  return (
    <form
      onSubmit={handleSubmit}
      className="customer-form"
    >
      <h2>Add Vendor / Customer</h2>

      {/* CONTACT PERSON */}
      <input
        type="text"
        name="customerName"
        placeholder="Contact Person Name"
        value={customer.customerName}
        onChange={handleChange}
        required
      />

      {/* MOBILE */}
      <input
        type="text"
        name="mobile"
        placeholder="Mobile Number"
        value={customer.mobile}
        onChange={handleChange}
        required
      />

      {/* EMAIL */}
      <input
        type="email"
        name="email"
        placeholder="Email ID"
        value={customer.email}
        onChange={handleChange}
        required
      />

      {/* ADDRESS */}
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={customer.address}
        onChange={handleChange}
        required
      />

      {/* CITY */}
      <input
        type="text"
        name="city"
        placeholder="City"
        value={customer.city}
        onChange={handleChange}
        required
      />

      {/* STATE */}
      <input
        type="text"
        name="state"
        placeholder="State"
        value={customer.state}
        onChange={handleChange}
        required
      />

      {/* PINCODE */}
      <input
        type="text"
        name="pincode"
        placeholder="Pincode"
        value={customer.pincode}
        onChange={handleChange}
        required
      />

      {/* SAVE */}
      <button type="submit">
        Save
      </button>
    </form>
  );
};