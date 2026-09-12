import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

const ALLOWED_ROLES = ["admin"];

export const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    resetPassword: "",
    role: "admin",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // FETCH USER FOR EDIT
  // ============================================
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(
          `/admin/users/${id}`
        );

        setUserData((prev) => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
          role: res.data.role || "admin",
        }));
      } catch (err) {
        console.error(
          "Failed to load user:",
          err
        );

        setError(
          err.response?.data?.error ||
            "Failed to load user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // ============================================
  // HANDLE INPUT
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (id) {
        // ======================================
        // UPDATE USER
        // ======================================
        const updatedData = {
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };

        if (userData.resetPassword) {
          updatedData.password =
            userData.resetPassword;
        }

        await api.put(
          `/admin/users/${id}`,
          updatedData
        );
      } else {
        // ======================================
        // ADD USER
        // ======================================
        if (!userData.password) {
          setError(
            "Password is required for new user"
          );
          return;
        }

        await api.post(
          "/admin/users",
          userData
        );
      }

      navigate("/admin/users");
    } catch (err) {
      console.error(
        "User save error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Something went wrong"
      );
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return <p>Loading...</p>;
  }

  // ============================================
  // FORM
  // ============================================
  return (
    <div className="user-form">
      <h2>
        {id ? "Edit User" : "Add User"}
      </h2>

      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "500px",
        }}
      >

        {/* NAME */}
        <div>
          <label>Name</label>

          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* EMAIL */}
        <div>
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* RESET PASSWORD */}
        {id && (
          <div>
            <label>
              Reset Password
            </label>

            <input
              type="password"
              name="resetPassword"
              value={
                userData.resetPassword
              }
              onChange={handleChange}
              placeholder="Leave blank if not changing"
            />
          </div>
        )}

        {/* NEW USER PASSWORD */}
        {!id && (
          <div>
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* ROLE */}
        <div>
          <label>Role</label>

          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
          >
            {ALLOWED_ROLES.map(
              (role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role
                    .charAt(0)
                    .toUpperCase() +
                    role.slice(1)}
                </option>
              )
            )}
          </select>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          style={{
            marginTop: "15px",
          }}
        >
          {id
            ? "Update User"
            : "Add User"}
        </button>

      </form>
    </div>
  );
};