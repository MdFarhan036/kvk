import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";

export const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FETCH ADMIN USER
  // ============================================
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `/admin/users/${id}`
      );

      setUser(res.data);
    } catch (err) {
      console.error(
        "❌ Error fetching user:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Failed to fetch user"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  // ============================================
  // DELETE USER
  // ============================================
  const deleteUser = async () => {
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

      alert(
        "✅ User deleted successfully"
      );

      navigate("/admin/users");
    } catch (err) {
      console.error(
        "❌ Error deleting user:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to delete user"
      );
    }
  };

  // ============================================
  // STATES
  // ============================================
  if (loading) {
    return (
      <p className="loading">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p
        style={{
          color: "red",
        }}
      >
        {error}
      </p>
    );
  }

  if (!user) {
    return <p>No user found</p>;
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="user-details-page">

      {/* HEADER */}
      <div className="user-header">

        <div className="user-info">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name || ""
            )}&background=random`}
            alt={user.name}
            className="user-avatar"
          />

          <div>
            <h2>{user.name}</h2>

            <p className="user-email">
              {user.email}
            </p>

            <span className="user-role">
              {user.role}
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="user-actions">

          <Link
            to={`/admin/users/edit/${user.id}`}
          >
            <button className="btn-primary">
              Edit
            </button>
          </Link>

          <button
            className="btn-danger"
            onClick={deleteUser}
          >
            Delete Account
          </button>

        </div>
      </div>

      {/* DETAILS */}
      <div className="user-details-grid">

        {/* BASIC DETAILS */}
        <div className="user-details-card">
          <h3>Basic Details</h3>

          <p>
            <strong>Email:</strong>{" "}
            {user.email}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {user.role}
          </p>

          <p>
            <strong>Created At:</strong>{" "}
            {user.createdAt
              ? new Date(
                  user.createdAt
                ).toLocaleString()
              : "-"}
          </p>
        </div>

        {/* ACCOUNT INFO */}
        <div className="user-details-card">
          <h3>Account Info</h3>

          <p>
            <strong>Status:</strong>{" "}
            Active
          </p>

          <p>
            <strong>ID:</strong>{" "}
            {user.id}
          </p>
        </div>

      </div>
    </div>
  );
};