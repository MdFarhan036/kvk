import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // FETCH CUSTOMER DETAILS
  // ============================================
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(
          `/admin/customers/${id}`
        );

        setCustomer(res.data);
      } catch (err) {
        console.error(
          "Error fetching customer details:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  // ============================================
  // DELETE CUSTOMER
  // ============================================
  const deleteCustomer = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this customer?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/admin/customers/${id}`
      );

      navigate("/customers");
    } catch (err) {
      console.error(
        "Error deleting customer:",
        err
      );
    }
  };

  // ============================================
  // LOADING / EMPTY STATE
  // ============================================
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="user-details-container">

      {/* HEADER */}
      <div className="user-header">
        <h2>
          {customer.customerName}
        </h2>

        <p>{customer.email}</p>

        <small>
          Customer ID: {customer.id}
        </small>
      </div>

      {/* MAIN BODY */}
      <div className="details-grid">

        {/* BASIC DETAILS */}
        <div className="user-details-card-left">
          <h3>Basic Details</h3>

          <p>
            <b>Phone:</b>{" "}
            {customer.mobile}
          </p>

          <p>
            <b>Email:</b>{" "}
            {customer.email}
          </p>

          <p>
            <b>State:</b>{" "}
            {customer.state}
          </p>

          <p>
            <b>City:</b>{" "}
            {customer.city}
          </p>

          <p>
            <b>Address:</b>{" "}
            {customer.address}
          </p>

          <p>
            <b>Pincode:</b>{" "}
            {customer.pincode}
          </p>

          <p>
            <b>Created At:</b>{" "}
            {customer.createdAt
              ? new Date(
                  customer.createdAt
                ).toLocaleDateString()
              : "-"}
          </p>
        </div>

        {/* RIGHT CARDS */}
        <div className="user-details-card-right-container">

          {/* ORDER SUMMARY */}
          <div className="user-details-card-right">
            <h3>Order Summary</h3>

            <p>
              <b>Total Orders:</b>{" "}
              {customer.totalOrders ?? 0}
            </p>

            <p>
              <b>Total Spent:</b>{" "}
              ₹
              {Number(
                customer.totalSpent ?? 0
              ).toFixed(2)}
            </p>

            <button
              onClick={() =>
                navigate(
                  `/orders/${customer.id}`
                )
              }
              className="view-orders-btn"
            >
              View Orders
            </button>
          </div>

          {/* DATA MANAGEMENT */}
          <div className="user-details-card-right">
            <h3>Data Management</h3>

            <button
              className="delete-btn"
              onClick={deleteCustomer}
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};