import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./AllBrands.css"

export const AddBrand = () => {
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ============================================
  // ADD BRAND
  // ============================================
  const handleAddBrand = async (e) => {
    e.preventDefault();
    setError("");

    if (!brandName.trim()) {
      setError("Brand name is required.");
      return;
    }

    if (!brandImage) {
      setError("Brand image is required.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("brand_name", brandName.trim());
      formData.append("brand_image", brandImage);

      await api.post("/brands", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/brands/brandsTable");
    } catch (err) {
      console.error("❌ Error adding brand:", err);

      if (err.response?.status === 400) {
        setError("Brand already exists.");
      } else {
        setError("Failed to add brand.");
      }
    }
  };

  return (
    <main className="user-details-page">
      <h2>Add Brand</h2>

      <form
        onSubmit={handleAddBrand}
        className="admin-form"
      >
        {/* Brand Name */}
        <label htmlFor="brand-name">
          Brand Name:
        </label>

        <input
          id="brand-name"
          type="text"
          value={brandName}
          onChange={(e) =>
            setBrandName(e.target.value)
          }
          placeholder="Enter brand name"
          required
        />

        {/* Brand Image */}
        <label htmlFor="brand-image">
          Brand Image:
        </label>

        <input
          id="brand-image"
          type="file"
          accept="image/*"
          onChange={(e) =>
            setBrandImage(
              e.target.files?.[0] || null
            )
          }
          required
        />

        {/* Error */}
        {error && (
          <p
            style={{
              color: "red",
              marginTop: "8px",
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="upload-btn"
        >
          Add Brand
        </button>
      </form>
    </main>
  );
};