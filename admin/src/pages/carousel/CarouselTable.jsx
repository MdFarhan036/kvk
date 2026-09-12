import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HomeCarousel.css";

import api, { ASSET_BASE_URL } from "../api";

export const CarouselTable = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FETCH CAROUSEL SLIDES
  // ============================================
  const fetchSlides = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/carousel/admin");

      setSlides(
        Array.isArray(res.data)
          ? res.data
          : res.data.slides || []
      );
    } catch (err) {
      console.error(
        "❌ Error fetching carousel slides:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Failed to fetch carousel slides."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // ============================================
  // DELETE SLIDE
  // ============================================
  const remove = async (id) => {
    if (!window.confirm("Delete this slide?")) {
      return;
    }

    try {
      await api.delete(`/carousel/${id}`);

      setSlides((prev) =>
        prev.filter((slide) => slide.id !== id)
      );
    } catch (err) {
      console.error(
        "❌ Error deleting slide:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to delete slide."
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

      {/* HEADER */}
      <div className="adminproduct-head">
        <h2>Home Carousel</h2>

        <Link to="/carousels/add">
          <button className="upload-btn">
            + Add Slide
          </button>
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* CAROUSEL TABLE */}
      <table className="table-customer">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Status</th>
            <th>Sort</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {slides.length > 0 ? (
            slides.map((slide) => (
              <tr key={slide.id}>

                {/* IMAGE */}
                <td>
                  <img
                    src={`${ASSET_BASE_URL}${slide.image}`}
                    alt={
                      slide.title ||
                      "carousel"
                    }
                    height="60"
                  />
                </td>

                {/* TITLE */}
                <td>
                  {slide.title || "-"}
                </td>

                {/* STATUS */}
                <td>
                  <span
                    className={`status ${slide.status}`}
                  >
                    {slide.status}
                  </span>
                </td>

                {/* SORT */}
                <td>
                  {slide.sort_order}
                </td>

                {/* ACTIONS */}
                <td>
                  <Link
                    to={`/carousels/edit/${slide.id}`}
                    className="preview-icon"
                  >
                    Edit
                  </Link>

                  <span
                    onClick={() =>
                      remove(slide.id)
                    }
                    className="preview-icon"
                    style={{
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                  >
                    Delete
                  </span>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                }}
              >
                No slides found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
};