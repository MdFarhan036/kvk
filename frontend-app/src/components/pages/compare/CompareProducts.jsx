// src/pages/user/CompareProducts.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../../api.js";

import "./CompareProducts.css";

const COMPARE_STORAGE_KEY = "compareProducts";
const MAX_COMPARE_PRODUCTS = 4;

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (url) => {
  if (!url) {
    return "/fallback-image.png";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${ASSET_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
};

/* =========================================================
   PRODUCT IMAGE
========================================================= */

const getProductImage = (product) => {
  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    return getImageUrl(product.images[0]);
  }

  if (product?.pimage) {
    return getImageUrl(product.pimage);
  }

  if (product?.image) {
    return getImageUrl(product.image);
  }

  return "/fallback-image.png";
};

/* =========================================================
   PRODUCT NAME
========================================================= */

const getProductName = (product) => {
  return (
    product?.name ||
    product?.title ||
    "Unnamed Product"
  );
};

/* =========================================================
   PRODUCT ID
========================================================= */

const getProductId = (product) => {
  return (
    product?.id ||
    product?.productId ||
    product?._id
  );
};

/* =========================================================
   COMPARE PAGE
========================================================= */

export const CompareProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     LOAD COMPARE PRODUCTS
  ======================================================= */

  useEffect(() => {
    const loadCompareProducts = async () => {
      try {
        setLoading(true);

        const stored =
          localStorage.getItem(
            COMPARE_STORAGE_KEY
          );

        if (!stored) {
          setProducts([]);
          return;
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          setProducts([]);
          return;
        }

        /*
         * If complete product objects are already
         * stored, use them directly.
         */

        const completeProducts =
          parsed.filter(
            (item) =>
              typeof item === "object" &&
              item !== null
          );

        if (completeProducts.length) {
          setProducts(
            completeProducts.slice(
              0,
              MAX_COMPARE_PRODUCTS
            )
          );

          return;
        }

        /*
         * If only product IDs were stored,
         * fetch all products and find them.
         */

        const ids = parsed
          .map((item) => {
            if (
              typeof item === "object" &&
              item !== null
            ) {
              return getProductId(item);
            }

            return item;
          })
          .filter(Boolean);

        if (!ids.length) {
          setProducts([]);
          return;
        }

        const { data } =
          await api.get("/products");

        const allProducts =
          Array.isArray(data)
            ? data
            : [];

        const matchedProducts =
          ids
            .map((id) =>
              allProducts.find(
                (product) =>
                  String(
                    getProductId(product)
                  ) === String(id)
              )
            )
            .filter(Boolean);

        setProducts(
          matchedProducts.slice(
            0,
            MAX_COMPARE_PRODUCTS
          )
        );
      } catch (error) {
        console.error(
          "Failed to load compare products:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompareProducts();
  }, []);

  /* =======================================================
     REMOVE PRODUCT
  ======================================================= */

  const removeProduct = (productId) => {
    const updated = products.filter(
      (product) =>
        String(
          getProductId(product)
        ) !== String(productId)
    );

    setProducts(updated);

    localStorage.setItem(
      COMPARE_STORAGE_KEY,
      JSON.stringify(updated)
    );
  };

  /* =======================================================
     CLEAR ALL
  ======================================================= */

  const clearCompare = () => {
    setProducts([]);

    localStorage.removeItem(
      COMPARE_STORAGE_KEY
    );
  };

  /* =======================================================
     PRODUCT VALUES
  ======================================================= */

  const getPrice = (product) => {
    return Number(
      product?.price || 0
    );
  };

  const getDiscountPrice = (product) => {
    return Number(
      product?.discount_price ||
        product?.price ||
        0
    );
  };

  const getStock = (product) => {
    const stock = Number(
      product?.stock || 0
    );

    return stock > 0
      ? `In Stock (${stock})`
      : "Out of Stock";
  };

  const getRating = (product) => {
    return (
      product?.rating ??
      product?.average_rating ??
      "—"
    );
  };

  const getCategory = (product) => {
    return (
      product?.category_name ||
      product?.category ||
      "—"
    );
  };

  const getBrand = (product) => {
    return (
      product?.brand ||
      product?.brand_name ||
      "—"
    );
  };

  const getDescription = (product) => {
    return (
      product?.short_description ||
      product?.description ||
      product?.excerpt ||
      "No description available."
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="compare-page">
        <div className="compare-container">
          <div className="compare-loading">
            Loading comparison...
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!products.length) {
    return (
      <section className="compare-page">
        <div className="compare-container">

          <div className="compare-header">
            <h1>Compare Products</h1>
            <p>
              Compare products side by side
              before making your decision.
            </p>
          </div>

          <div className="compare-empty">

            <div className="compare-empty-icon">
              ⚖️
            </div>

            <h2>
              No Products to Compare
            </h2>

            <p>
              Add products to your comparison
              list and they will appear here.
            </p>

            <Link
              to="/products"
              className="compare-shop-btn"
            >
              Browse Products
            </Link>

          </div>

        </div>
      </section>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <section className="compare-page">

      <div className="compare-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="compare-header">

          <div>
            <h1>
              Compare Products
            </h1>

            <p>
              Compare up to{" "}
              {MAX_COMPARE_PRODUCTS} products
              side by side.
            </p>
          </div>

          <button
            type="button"
            className="compare-clear-btn"
            onClick={clearCompare}
          >
            Clear All
          </button>

        </div>

        {/* =================================================
            PRODUCT TABLE
        ================================================= */}

        <div className="compare-table-wrapper">

          <table className="compare-table">

            <thead>

              <tr>

                <th className="compare-feature-column">
                  Product Details
                </th>

                {products.map((product) => {
                  const productId =
                    getProductId(product);

                  return (
                    <th
                      key={productId}
                      className="compare-product-column"
                    >

                      <div className="compare-product-header">

                        <button
                          type="button"
                          className="compare-remove-btn"
                          onClick={() =>
                            removeProduct(
                              productId
                            )
                          }
                          aria-label={`Remove ${getProductName(
                            product
                          )}`}
                        >
                          ×
                        </button>

                        <img
                          src={getProductImage(
                            product
                          )}
                          alt={getProductName(
                            product
                          )}
                          className="compare-product-image"
                        />

                        <h2>
                          {getProductName(
                            product
                          )}
                        </h2>

                      </div>

                    </th>
                  );
                })}

              </tr>

            </thead>

            <tbody>

              {/* BRAND */}

              <tr>
                <td>
                  <strong>
                    Brand
                  </strong>
                </td>

                {products.map((product) => (
                  <td
                    key={getProductId(
                      product
                    )}
                  >
                    {getBrand(product)}
                  </td>
                ))}
              </tr>

              {/* CATEGORY */}

              <tr>
                <td>
                  <strong>
                    Category
                  </strong>
                </td>

                {products.map((product) => (
                  <td
                    key={getProductId(
                      product
                    )}
                  >
                    {getCategory(product)}
                  </td>
                ))}
              </tr>

              {/* PRICE */}

              <tr>
                <td>
                  <strong>
                    Price
                  </strong>
                </td>

                {products.map((product) => (
                  <td
                    key={getProductId(
                      product
                    )}
                  >
                    <span className="compare-price">
                      ₹
                      {getPrice(
                        product
                      ).toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* DISCOUNT PRICE */}

              <tr>
                <td>
                  <strong>
                    Selling Price
                  </strong>
                </td>

                {products.map((product) => (
                  <td
                    key={getProductId(
                      product
                    )}
                  >
                    <span className="compare-discount-price">
                      ₹
                      {getDiscountPrice(
                        product
                      ).toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* STOCK */}

              <tr>
                <td>
                  <strong>
                    Availability
                  </strong>
                </td>

                {products.map((product) => {
                  const stock =
                    Number(
                      product?.stock || 0
                    );

                  return (
                    <td
                      key={getProductId(
                        product
                      )}
                    >
                      <span
                        className={
                          stock > 0
                            ? "compare-stock in-stock"
                            : "compare-stock out-stock"
                        }
                      >
                        {getStock(
                          product
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* RATING */}

              <tr>
                <td>
                  <strong>
                    Rating
                  </strong>
                </td>

                {products.map((product) => (
                  <td
                    key={getProductId(
                      product
                    )}
                  >
                    <span className="compare-rating">
                      ★{" "}
                      {getRating(
                        product
                      )}
                    </span>
                  </td>
                ))}
              </tr>

              {/* DESCRIPTION */}

              <tr className="compare-description-row">
                <td>
                  <strong>
                    Description
                  </strong>
                </td>

                {products.map((product) => (
                  <td
                    key={getProductId(
                      product
                    )}
                  >
                    <p>
                      {getDescription(
                        product
                      )}
                    </p>
                  </td>
                ))}
              </tr>

              {/* STATUS */}

              <tr>
                <td>
                  <strong>
                    Status
                  </strong>
                </td>

                {products.map((product) => (
                  <td
                    key={getProductId(
                      product
                    )}
                  >
                    {product?.status ||
                      "Available"}
                  </td>
                ))}
              </tr>

              {/* ACTION */}

              <tr className="compare-action-row">

                <td>
                  <strong>
                    Action
                  </strong>
                </td>

                {products.map((product) => {
                  const productId =
                    getProductId(product);

                  return (
                    <td
                      key={productId}
                    >
                      <div className="compare-actions">

                        <button
                          type="button"
                          className="compare-view-btn"
                          onClick={() =>
                            navigate(
                              `/product/${productId}`
                            )
                          }
                        >
                          View Product
                        </button>

                        <button
                          type="button"
                          className="compare-remove-link"
                          onClick={() =>
                            removeProduct(
                              productId
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>
                    </td>
                  );
                })}

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );
};

export default CompareProducts;