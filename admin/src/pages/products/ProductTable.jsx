import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api";
import viewimg from "../../assets/159078.png";
import editimg from "../../assets/edit-new-icon-22.png";
import deleteimg from "../../assets/1214428.png";
import { ProductContext } from "../../context/ProductContext.jsx";
import "./ProductTable.css";

export const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalPrice, setModalPrice] = useState("");
  const [modalImage, setModalImage] = useState(null);

  const { refreshFlag } = useContext(ProductContext);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [search, setSearch] = useState("");

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  useEffect(() => {
    fetchProducts();
  }, [refreshFlag]);

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);

      setProducts(
        products.filter((p) => p.id !== id)
      );
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // =====================================================
  // TOGGLE POPULAR
  // =====================================================

  const togglePopular = async (id, currentValue) => {
    try {
      const newValue = currentValue ? 0 : 1;

      await api.patch(`/products/${id}/popular`, {
        is_popular: newValue,
      });

      setProducts(
        products.map((p) =>
          p.id === id
            ? {
                ...p,
                is_popular: newValue,
              }
            : p
        )
      );
    } catch (err) {
      console.error(
        "Error updating popular status:",
        err
      );
    }
  };

  // =====================================================
  // DAILY DEAL MODAL
  // =====================================================

  const openDailyDealModal = (product) => {
    setModalProduct(product);

    setModalPrice(
      product.daily_deal_price || product.price
    );
  };

  const closeModal = () => {
    setModalProduct(null);
    setModalPrice("");
  };

  // =====================================================
  // SUBMIT DAILY DEAL
  // =====================================================

  const submitDailyDeal = async () => {
    try {
      const newValue = modalProduct.is_daily_deal
        ? 0
        : 1;

      await api.patch(
        `/products/${modalProduct.id}/dailydeal`,
        {
          is_daily_deal: newValue,
          daily_deal_price: modalPrice,
        }
      );

      setProducts(
        products.map((p) =>
          p.id === modalProduct.id
            ? {
                ...p,
                is_daily_deal: newValue,
                daily_deal_price: modalPrice,
              }
            : p
        )
      );

      closeModal();
    } catch (err) {
      console.error(
        "Failed to update daily deal",
        err
      );

      alert("Failed to update daily deal");
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (id, status) => {
    try {
      await api.patch(
        `/products/${id}/status`,
        { status }
      );

      setProducts(
        products.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
              }
            : p
        )
      );
    } catch (err) {
      console.error(
        "Error updating status:",
        err
      );
    }
  };

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter
      ? p.category_id === parseInt(categoryFilter)
      : true;

    const matchesStatus = statusFilter
      ? p.status === statusFilter
      : true;

    const matchesStock =
      stockFilter === "in"
        ? p.stock > 0
        : stockFilter === "out"
          ? p.stock === 0
          : true;

    const searchText = search.toLowerCase();

    const matchesSearch =
      p.title.toLowerCase().includes(searchText) ||
      p.brand.toLowerCase().includes(searchText) ||
      (p.category_name &&
        p.category_name
          .toLowerCase()
          .includes(searchText));

    return (
      matchesCategory &&
      matchesStatus &&
      matchesStock &&
      matchesSearch
    );
  });

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="all-adminproducts">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="adminproduct-head">
        <h2>All Products</h2>

        <Link to="/allproducts/uploadProduct">
          <button className="upload-btn">
            + Add Product
          </button>
        </Link>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search by title, brand, or category"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            padding: "8px",
            width: "300px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="filter-bar">

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="">
            All Categories
          </option>

          {categories.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
            >
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">
            All Status
          </option>

          <option value="draft">
            Draft
          </option>

          <option value="published">
            Published
          </option>
        </select>

        <select
          value={stockFilter}
          onChange={(e) =>
            setStockFilter(e.target.value)
          }
        >
          <option value="">
            All Stock
          </option>

          <option value="in">
            In Stock
          </option>

          <option value="out">
            Out of Stock
          </option>
        </select>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="adminproduct-body">

        <div className="table-container">

          <table className="table-customer">

            <thead>
              <tr>
                <th>Images</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Popular</th>
                <th>Daily Deal</th>
                <th>Daily Deal Price</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (

                  <tr
                    key={product.id}
                    className={
                      product.is_daily_deal === 1
                        ? "daily-deal-active"
                        : ""
                    }
                  >

                    {/* IMAGE */}

                    <td>
                      {product.images &&
                      product.images.length > 0 ? (

                        <img
                          src={`${ASSET_BASE_URL}${product.images[0]}`}
                          alt={product.title}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setModalImage(
                              product.images[0]
                            )
                          }
                        />

                      ) : (
                        <span>
                          No Images
                        </span>
                      )}
                    </td>

                    {/* NAME */}

                    <td>
                      {product.title}
                    </td>

                    {/* CATEGORY */}

                    <td>
                      {product.category_name}
                    </td>

                    {/* STOCK */}

                    <td>
                      {product.stock > 0
                        ? `In Stock (${product.stock})`
                        : "Out of Stock"}
                    </td>

                    {/* PRICE */}

                    <td>
                      ₹{product.price}
                    </td>

                    {/* STATUS */}

                    <td>
                      <select
                        value={product.status}
                        onChange={(e) =>
                          updateStatus(
                            product.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="draft">
                          Draft
                        </option>

                        <option value="published">
                          Published
                        </option>
                      </select>
                    </td>

                    {/* POPULAR */}

                    <td>
                      <button
                        className={
                          product.is_popular
                            ? "popular-yes"
                            : "popular-no"
                        }
                        onClick={() =>
                          togglePopular(
                            product.id,
                            product.is_popular
                          )
                        }
                      >
                        {product.is_popular
                          ? "Yes"
                          : "No"}
                      </button>
                    </td>

                    {/* DAILY DEAL */}

                    <td>
                      <input
                        type="checkbox"
                        checked={
                          product.is_daily_deal === 1
                        }
                        onChange={() =>
                          openDailyDealModal(product)
                        }
                      />
                    </td>

                    {/* DAILY DEAL PRICE */}

                    <td>
                      {product.is_daily_deal
                        ? `₹${product.daily_deal_price}`
                        : "-"}
                    </td>

                    {/* ACTIONS */}

                    <td>

                      <Link
                        className="preview-icon"
                        to={`/allproducts/productDetails/${product.id}`}
                      >
                        <img
                          src={viewimg}
                          alt="View"
                        />
                      </Link>

                      <Link
                        className="preview-icon"
                        to={`/allproducts/edit/${product.id}`}
                      >
                        <img
                          src={editimg}
                          alt="Edit"
                        />
                      </Link>

                      <span
                        className="preview-icon"
                        onClick={() =>
                          deleteProduct(product.id)
                        }
                      >
                        <img
                          src={deleteimg}
                          alt="Delete"
                        />
                      </span>

                    </td>

                  </tr>
                ))
              ) : (

                <tr>
                  <td
                    colSpan="10"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    No products found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          DAILY DEAL MODAL
      ================================================= */}

      {modalProduct && (
        <div className="modal-backdrop">

          <div className="modal">

            <h3>
              {modalProduct.title}
            </h3>

            <label>
              Daily Deal Price:

              <input
                type="number"
                value={modalPrice}
                onChange={(e) =>
                  setModalPrice(e.target.value)
                }
              />
            </label>

            <div style={{ marginTop: "15px" }}>

              <button
                onClick={submitDailyDeal}
              >
                Submit
              </button>

              <button
                onClick={closeModal}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          FULL SCREEN IMAGE MODAL
      ================================================= */}

      {modalImage && (
        <div
          className="image-modal"
          onClick={() =>
            setModalImage(null)
          }
        >
          <img
            className="preview-icon"
            src={`${ASSET_BASE_URL}${modalImage}`}
            alt="Full View"
          />
        </div>
      )}

    </main>
  );
};