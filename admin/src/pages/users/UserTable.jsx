import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

import viewimg from "../../assets/159078.png";
import editimg from "../../assets/edit-new-icon-22.png";
import deleteimg from "../../assets/1214428.png";

export const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // FETCH ADMIN USERS
  // ============================================
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/users");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.users || [];

      setUsers(data);
    } catch (err) {
      console.error(
        "❌ Error fetching users:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ============================================
  // DELETE ADMIN USER
  // ============================================
  const deleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/admin/users/${id}`
      );

      setUsers((prev) =>
        prev.filter((user) => user.id !== id)
      );
    } catch (err) {
      console.error(
        "❌ Error deleting user:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to delete user."
      );
    }
  };

  // ============================================
  // SEARCH
  // ============================================
  const searchQuery = search.toLowerCase();

  const filteredUsers = users.filter(
    (user) =>
      user.name
        ?.toLowerCase()
        .includes(searchQuery) ||
      user.email
        ?.toLowerCase()
        .includes(searchQuery) ||
      user.role
        ?.toLowerCase()
        .includes(searchQuery)
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <main className="user-details-page">

      {/* HEADER */}
      <div className="adminproduct-head">
        <h2>All Admin Users</h2>

        <Link to="/users/addUser">
          <button className="upload-btn">
            + Add User
          </button>
        </Link>
      </div>

      {/* SEARCH */}
      <div
        style={{
          marginBottom: "15px",
        }}
      >
        <input
          type="text"
          placeholder="Search by name, email or role"
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
      </div>

      {/* LOADING */}
      {loading && (
        <p>Loading users...</p>
      )}

      {/* ERROR */}
      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}

      {/* USERS TABLE */}
      <table className="table-customer">

        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id}>

                {/* NAME */}
                <td>
                  {user.name}
                </td>

                {/* EMAIL */}
                <td>
                  {user.email}
                </td>

                {/* ROLE */}
                <td>
                  {user.role}
                </td>

                {/* CREATED */}
                <td>
                  {user.createdAt
                    ? new Date(
                        user.createdAt
                      ).toLocaleDateString()
                    : "-"}
                </td>

                {/* ACTIONS */}
                <td>

                  {/* VIEW */}
                  <Link
                    to={`/users/${user.id}`}
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
                    to={`/users/edit/${user.id}`}
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
                      deleteUser(user.id)
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
                  colSpan="5"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No admin users found
                </td>
              </tr>
            )
          )}
        </tbody>

      </table>
    </main>
  );
};