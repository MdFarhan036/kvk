import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

import viewimg from "../../assets/159078.png";
import editimg from "../../assets/edit-new-icon-22.png";
import deleteimg from "../../assets/1214428.png";

export const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ============================================
  // FETCH CUSTOMERS
  // ============================================
  const fetchCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/customers");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.customers || [];

      setCustomers(data);
    } catch (err) {
      console.error(
        "❌ Error fetching customers:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Failed to fetch customers. Make sure you are logged in as admin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [sortOrder]);

  // ============================================
  // DELETE CUSTOMER
  // ============================================
  const deleteCustomer = async (id) => {
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

      setCustomers((prev) =>
        prev.filter((c) => c.id !== id)
      );
    } catch (err) {
      console.error(
        "❌ Error deleting customer:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to delete customer."
      );
    }
  };

  // ============================================
  // SEARCH + SORT
  // ============================================
  const filteredCustomers = Array.isArray(
    customers
  )
    ? customers
        .filter((c) =>
          [
            c.customerName,
            c.email,
            c.mobile,
            c.address,
            c.city,
            c.state,
            c.pincode,
          ]
            .filter(Boolean)
            .some((field) =>
              String(field)
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
            )
        )
        .sort((a, b) =>
          sortOrder === "newest"
            ? b.id - a.id
            : a.id - b.id
        )
    : [];

  // ============================================
  // RENDER
  // ============================================
  return (
    <main className="user-details-page">

      {/* HEADER */}
      <div className="adminproduct-head">
        <h2>All Customers</h2>
      </div>

      {/* FILTER BAR */}
      <div
        style={{
          marginBottom: "15px",
        }}
      >
        <input
          type="text"
          placeholder="Search by name, email, mobile, or address"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            marginLeft: "10px",
            padding: "5px",
            width: "300px",
          }}
        />

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value)
          }
          style={{
            marginLeft: "10px",
            padding: "5px",
          }}
        >
          <option value="newest">
            Newest
          </option>

          <option value="oldest">
            Oldest
          </option>
        </select>
      </div>

      {/* LOADING */}
      {loading && (
        <p>Loading customers...</p>
      )}

      {/* ERROR */}
      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* CUSTOMER TABLE */}
      <table className="table-customer">

        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Total Orders</th>
            <th>Total Spent</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <tr key={customer.id}>

                {/* NAME */}
                <td>
                  {customer.customerName}
                </td>

                {/* ADDRESS */}
                <td>
                  {[
                    customer.address,
                    customer.city,
                    customer.state,
                    customer.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </td>

                {/* TOTAL ORDERS */}
                <td>
                  <Link
                    to={`/customers/customer/${customer.id}/orders`}
                    style={{
                      color: "blue",
                      textDecoration:
                        "underline",
                      cursor: "pointer",
                    }}
                  >
                    {customer.totalOrders ||
                      0}
                  </Link>
                </td>

                {/* TOTAL SPENT */}
                <td>
                  ₹
                  {Number(
                    customer.totalSpent ||
                      0
                  ).toFixed(2)}
                </td>

                {/* JOINED */}
                <td>
                  {customer.createdAt
                    ? new Date(
                        customer.createdAt
                      ).toLocaleDateString()
                    : "-"}
                </td>

                {/* ACTIONS */}
                <td>

                  {/* VIEW */}
                  <Link
                    to={`/customers/${customer.id}`}
                  >
                    <span className="preview-icon">
                      <img
                        src={viewimg}
                        alt="view"
                      />
                    </span>
                  </Link>

                  {/* EDIT */}
                  <Link
                    to={`/customers/edit/${customer.id}`}
                  >
                    <span className="preview-icon">
                      <img
                        src={editimg}
                        alt="edit"
                      />
                    </span>
                  </Link>

                  {/* DELETE */}
                  <span
                    onClick={() =>
                      deleteCustomer(
                        customer.id
                      )
                    }
                    className="preview-icon"
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={deleteimg}
                      alt="delete"
                    />
                  </span>

                </td>

              </tr>
            ))
          ) : (
            !loading && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No customers found
                </td>
              </tr>
            )
          )}
        </tbody>

      </table>
    </main>
  );
};