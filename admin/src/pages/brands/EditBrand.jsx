// src/admin/brands/EditBrand.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AllBrands.css"
import api, { ASSET_BASE_URL } from "../api";

export const EditBrand = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [brandName, setBrandName] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD BRAND
  // ============================================
  const loadBrand = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/brands/${id}`);

      setBrandName(res.data.brand_name || "");
      setCurrentImage(res.data.image || "");
    } catch (err) {
      console.error(
        "❌ Failed to load brand:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Failed to load brand."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrand();
  }, [id]);

  // ============================================
  // UPDATE BRAND
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!brandName.trim()) {
      setError("Brand name is required.");
      return;
    }

    const formData = new FormData();

    formData.append(
      "brand_name",
      brandName.trim()
    );

    if (newImage) {
      formData.append(
        "brand_image",
        newImage
      );
    }

    try {
      await api.put(
        `/brands/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      navigate("/brandsTable");
    } catch (err) {
      console.error(
        "❌ Update failed:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Failed to update brand."
      );
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <main className="user-details-page">
        <p>Loading...</p>
      </main>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <main className="user-details-page">
      <h2>Edit Brand</h2>

      <form
        onSubmit={handleSubmit}
        className="admin-form"
      >
        {/* BRAND NAME */}
        <div>
          <label htmlFor="brand-name">
            Brand Name
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
        </div>

        {/* CURRENT IMAGE */}
        {currentImage && (
          <div>
            <label>
              Current Image
            </label>

            <img
              src={`${ASSET_BASE_URL}${currentImage}`}
              alt={brandName || "Brand"}
              className="brand-current-image"
            />
          </div>
        )}

        {/* NEW IMAGE */}
        <div>
          <label htmlFor="brand-image">
            Change Image (optional)
          </label>

          <input
            id="brand-image"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewImage(
                e.target.files?.[0] || null
              )
            }
          />
        </div>

        {/* ERROR */}
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

        {/* SUBMIT */}
        <button
          type="submit"
          className="upload-btn"
        >
          Update Brand
        </button>
      </form>
    </main>
  );
};