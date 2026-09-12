import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../api.js";

import "./HomeCarousel.css";


export const EditCarousel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("active");
  const [sortOrder, setSortOrder] = useState(0);
  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // IMAGE URL
  // ============================================

  const getImageUrl = (image) => {
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  // ============================================
  // FETCH CAROUSEL
  // ============================================

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          `/carousel/${id}`
        );

        setTitle(data.title || "");
        setLink(data.link || "");
        setStatus(data.status || "active");
        setSortOrder(data.sort_order ?? 0);
        setCurrentImage(data.image || "");
      } catch (err) {
        console.error(
          "❌ Error fetching carousel:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load carousel."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCarousel();
  }, [id]);

  // ============================================
  // SUBMIT
  // ============================================

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const fd = new FormData();

      fd.append("title", title);
      fd.append("link", link);
      fd.append("status", status);
      fd.append("sort_order", sortOrder);

      if (newImage) {
        fd.append("image", newImage);
      }

      await api.put(
        `/carousel/${id}`,
        fd,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      navigate("/admin/carousel");
    } catch (err) {
      console.error(
        "❌ Error updating carousel:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update carousel."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <main className="edit-carousel-page">
        <div className="edit-carousel-card">
          <div className="edit-carousel-loading">
            Loading carousel...
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <main className="edit-carousel-page">

      <div className="edit-carousel-card">

        {/* HEADER */}

        <div className="edit-carousel-header">

          <div>
            <span className="edit-carousel-eyebrow">
              Home Carousel
            </span>

            <h2>Edit Carousel</h2>

            <p>
              Update the carousel slide details
              and image.
            </p>
          </div>

          <button
            type="button"
            className="edit-carousel-back"
            onClick={() =>
              navigate("/admin/carousel")
            }
          >
            ← Back
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="edit-carousel-error">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={submit}
          className="edit-carousel-form"
        >

          {/* TITLE */}

          <div className="edit-carousel-field">

            <label htmlFor="carousel-title">
              Title
            </label>

            <input
              id="carousel-title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Enter carousel title"
            />

          </div>

          {/* LINK */}

          <div className="edit-carousel-field">

            <label htmlFor="carousel-link">
              Link
            </label>

            <input
              id="carousel-link"
              type="text"
              value={link}
              onChange={(e) =>
                setLink(e.target.value)
              }
              placeholder="Enter link"
            />

          </div>

          {/* SORT ORDER */}

          <div className="edit-carousel-field">

            <label htmlFor="carousel-sort">
              Sort Order
            </label>

            <input
              id="carousel-sort"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value)
              }
              placeholder="Sort order"
            />

          </div>

          {/* STATUS */}

          <div className="edit-carousel-field">

            <label htmlFor="carousel-status">
              Status
            </label>

            <select
              id="carousel-status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>

          {/* CURRENT IMAGE */}

          {currentImage && (
            <div className="edit-carousel-image-section">

              <label>
                Current Image
              </label>

              <div className="edit-carousel-image-preview">

                <img
                  src={getImageUrl(
                    currentImage
                  )}
                  alt="Current carousel"
                />

              </div>

            </div>
          )}

          {/* NEW IMAGE */}

          <div className="edit-carousel-field">

            <label htmlFor="carousel-image">
              Replace Image
            </label>

            <input
              id="carousel-image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewImage(
                  e.target.files?.[0] || null
                )
              }
            />

            {newImage && (
              <span className="selected-image-name">
                Selected: {newImage.name}
              </span>
            )}

          </div>

          {/* ACTIONS */}

          <div className="edit-carousel-actions">

            <button
              type="button"
              className="edit-carousel-cancel"
              onClick={() =>
                navigate("/admin/carousel")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-carousel-submit"
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "Update Carousel"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
};