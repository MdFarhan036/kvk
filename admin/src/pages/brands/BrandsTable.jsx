import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AllBrands.css"

import viewimg from "../../assets/159078.png";
import editimg from "../../assets/edit-new-icon-22.png";
import deleteimg from "../../assets/1214428.png";

import api, { ASSET_BASE_URL } from "../api";

export const BrandsTable = () => {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // FETCH ALL BRANDS
  // ============================================
  const fetchBrands = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/brands");

      setBrands(
        Array.isArray(res.data)
          ? res.data
          : res.data.brands || []
      );
    } catch (err) {
      console.error(
        "❌ Error fetching brands:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Failed to fetch brands."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // ============================================
  // DELETE BRAND
  // ============================================
  const deleteBrand = async (id) => {
    if (!window.confirm("Delete this brand?")) {
      return;
    }

    try {
      await api.delete(`/brands/${id}`);

      setBrands((prev) =>
        prev.filter((brand) => brand.id !== id)
      );
    } catch (err) {
      console.error(
        "❌ Error deleting brand:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to delete brand."
      );
    }
  };

  // ============================================
  // SEARCH
  // ============================================
  const searchQuery = search.toLowerCase();

  const filteredBrands = brands.filter((brand) =>
    brand.brand_name
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
        <h2>All Brands</h2>

        <Link to="/brands/add">
          <button className="upload-btn">
            + Add Brand
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
          placeholder="Search brand name..."
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
      {loading && <p>Loading...</p>}

      {/* ERROR */}
      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* BRANDS TABLE */}
      <table className="table-customer">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Brand Name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <tr key={brand.id}>

                {/* ID */}
                <td>
                  {brand.id}
                </td>

                {/* IMAGE */}
                <td>
                  <img
                    src={`${ASSET_BASE_URL}${brand.image}`}
                    alt={brand.brand_name}
                    className="img-card"
                  />
                </td>

                {/* BRAND NAME */}
                <td>
                  {brand.brand_name}
                </td>

                {/* ACTIONS */}
                <td>

                  {/* VIEW */}
                  <Link
                    to={`/brands/${brand.id}`}
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
                    to={`/brands/edit/${brand.id}`}
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
                      deleteBrand(brand.id)
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
                  colSpan="4"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No brands found
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </main>
  );
};