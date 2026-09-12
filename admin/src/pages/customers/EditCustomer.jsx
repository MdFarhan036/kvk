import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export const EditCustomer = () => {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);

  // ============================================
  // FETCH CUSTOMER
  // ============================================
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get(
          `/customers/${id}`
        );

        setCustomer(response.data);
      } catch (err) {
        console.error(
          "Error fetching customer:",
          err
        );

        alert(
          "Failed to load customer data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

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
  // UPDATE CUSTOMER
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(
        `/customers/${id}`,
        customer
      );

      alert(
        "Customer updated successfully!"
      );

      navigate("/customers/list");
    } catch (err) {
      console.error(
        "Error updating customer:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Update failed. Check console."
      );
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return <div>Loading...</div>;
  }

  // ============================================
  // FORM
  // ============================================
  return (
    <form
      onSubmit={handleSubmit}
      className="customer-form"
    >
      <h2>Edit Customer</h2>

      {/* CUSTOMER NAME */}
      <input
        type="text"
        name="customerName"
        placeholder="User Name"
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

      {/* UPDATE */}
      <button type="submit">
        Update
      </button>
    </form>
  );
};