import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api";
import "./AllCategories.css";
import { useTranslation } from "react-i18next";

export const CategoryTable = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });

  // ================= FETCH =================
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data ?? []);
    } catch (err) {
      console.error(err);
      setMessage("❌ " + t("failedLoadCategories"));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDeleteCategory"))) return;

    try {
      await api.delete(`/categories/${id}`);
      setMessage("✅ " + t("deletedSuccessfully"));
      fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage("❌ " + t("deleteFailed"));
    }
  };

  // ================= SORT =================
  const handleSort = (key) => {
    let direction = "asc";

    if (
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const sorted = [...categories].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

    if (typeof a[sortConfig.key] === "string") {
      return sortConfig.direction === "asc"
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    }

    return sortConfig.direction === "asc"
      ? a[sortConfig.key] - b[sortConfig.key]
      : b[sortConfig.key] - a[sortConfig.key];
  });

  return (
    <main className="category-table">

      {/* HEADER */}
      <div className="adminproduct-head">
        <h1>{t("categories")} CMS</h1>

        {message && <p>{message}</p>}

        <Link to="/categories/uploadCategory">
          <button className="upload-btn">
            + {t("createCategory")}
          </button>
        </Link>
      </div>

      {/* TABLE */}
      <table className="table-customer">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID
            </th>

            <th onClick={() => handleSort("name")}>
              Name
            </th>

            <th>
              Slug
            </th>

            <th>
              SEO
            </th>

            <th>
              Image
            </th>

            <th>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((cat) => (
            <tr key={cat.id}>

              <td>
                {cat.id}
              </td>

              {/* NAME */}
              <td>
                <strong>
                  {cat.name}
                </strong>
              </td>

              {/* SLUG */}
              <td>
                <code>
                  /{cat.slug || "no-slug"}
                </code>

                {cat.slug && (
                  <div>
                    <Link
                      to={`/jaipur/${cat.slug}`}
                      target="_blank"
                    >
                      🔗 View Page
                    </Link>
                  </div>
                )}
              </td>

              {/* SEO INFO */}
              <td>
                <small>
                  {cat.meta_title || "No meta title"}
                </small>
              </td>

              {/* IMAGE */}
              <td>
                {cat.image && (
                  <img
                    src={`${ASSET_BASE_URL}${cat.image}`}
                    alt={cat.name}
                    className="img-card"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </td>

              {/* ACTIONS */}
              <td>
                <Link to={`/categories/edit/${cat.id}`}>
                  <button className="edit-btn">
                    Edit
                  </button>
                </Link>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}

          {sorted.length === 0 && (
            <tr>
              <td
                colSpan="6"
                style={{ textAlign: "center" }}
              >
                {t("noCategoriesFound")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </main>
  );
};