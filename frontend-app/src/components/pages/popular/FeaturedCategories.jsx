import { useState } from "react";
import { Link } from "react-router-dom";

import wishlistimg from "../../../assets/img/wishlist.png";
import previewimg from "../../../assets/img/eyeicon.jpg";

import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

import { ASSET_BASE_URL } from "../../api.js";

import "./Featured.css";

/* =========================================================
   STAR RATING
========================================================= */

const StarRating = ({ rating = 3, max = 5 }) => (
  <div
    className="product-rating"
    aria-label={`${rating} out of ${max} stars`}
  >
    {[...Array(max)].map((_, i) => (
      <span
        key={i}
        className={`star ${
          i < rating ? "star--filled" : ""
        }`}
      >
        ★
      </span>
    ))}
  </div>
);

/* =========================================================
   TOAST
========================================================= */

const Toast = ({ message, visible }) =>
  visible ? (
    <div className="fc-toast">
      {message}
    </div>
  ) : null;

/* =========================================================
   MAIN COMPONENT
========================================================= */

export const FeaturedCategories = ({
  featuredcategory,
}) => {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [toast, setToast] = useState({
    visible: false,
    message: "",
  });

  /* =======================================================
     TOAST HANDLER
  ======================================================= */

  const showToast = (msg) => {
    setToast({
      visible: true,
      message: msg,
    });

    setTimeout(() => {
      setToast({
        visible: false,
        message: "",
      });
    }, 2500);
  };

  /* =======================================================
     NO PRODUCTS
  ======================================================= */

  if (!featuredcategory?.products?.length) {
    return null;
  }

  /* =======================================================
     CATEGORY NAME
  ======================================================= */

  const categoryName =
    featuredcategory?.name ||
    featuredcategory?.category_name ||
    "";

  return (
    <>
      <Toast
        message={toast.message}
        visible={toast.visible}
      />

      <div className="featured-item">

        {featuredcategory.products.map((product) => {

          /* =================================================
             PRODUCT DATA
          ================================================= */

          const name =
            product.title ||
            product.name ||
            "Product";

          const price =
            Number(
              product.discount_price ??
              product.price ??
              0
            );

          const oldPrice =
            Number(
              product.oldPrice ??
              product.old_price ??
              product.original_price ??
              0
            );

          const stock =
            Number(product.stock ?? 0);

          const isOutOfStock =
            stock <= 0;

          /* =================================================
             DISCOUNT
          ================================================= */

          const discount =
            oldPrice > price && price > 0
              ? Math.round(
                  ((oldPrice - price) /
                    oldPrice) *
                    100
                )
              : null;

          /* =================================================
             CATEGORY
          ================================================= */

          const resolvedCategory =
            categoryName ||
            product.category_name ||
            product.category?.name ||
            "";

          /* =================================================
             PRODUCT LINK
          ================================================= */

          const productLink =
            resolvedCategory
              ? `/products-categories/${encodeURIComponent(
                  resolvedCategory
                )}/${product.id}`
              : `/product/${product.id}`;

          /* =================================================
             IMAGE
          ================================================= */

          const imageValue =
            product.images?.[0] ||
            product.image ||
            "";

          const imageSrc = imageValue
            ? /^https?:\/\//i.test(imageValue)
              ? imageValue
              : `${ASSET_BASE_URL}${
                  imageValue.startsWith("/")
                    ? ""
                    : "/"
                }${imageValue}`
            : null;

          /* =================================================
             BRAND
          ================================================= */

          const brand =
            typeof product.brand === "object"
              ? product.brand?.name
              : product.brand;

          /* =================================================
             RATING
          ================================================= */

          const rating =
            Number(product.rating ?? 3);

          return (
            <div
              className="product-card"
              key={product.id}
            >

              {/* ===========================================
                  BADGE
              =========================================== */}

              <span className="product-badge">
                Hot
              </span>

              {/* ===========================================
                  IMAGE
              =========================================== */}

              <div className="product-imgcard">

                {imageSrc ? (
                  <img
                    className="product-image"
                    src={imageSrc}
                    alt={name}
                    loading="lazy"
                  />
                ) : (
                  <div className="product-no-image">
                    No Image
                  </div>
                )}

                {/* =========================================
                    PREVIEW
                ========================================= */}

                <div className="img_overlay">

                  <ul className="list-product-overlay">

                    <li
                      className="list-item-overlay"
                      title="Quick View"
                    >
                      <Link to={productLink}>
                        <img
                          src={previewimg}
                          alt="Preview"
                        />
                      </Link>
                    </li>

                  </ul>

                </div>

                {/* =========================================
                    WISHLIST
                ========================================= */}

                <button
                  type="button"
                  className="wishlist-btn"
                  aria-label={`Add ${name} to wishlist`}
                  onClick={() => {
                    addToWishlist({
                      ...product,
                      quantity: 1,
                    });

                    showToast(
                      `${name} added to wishlist!`
                    );
                  }}
                >
                  <img
                    src={wishlistimg}
                    alt="Wishlist"
                  />
                </button>

              </div>

              {/* ===========================================
                  CARD BODY
              =========================================== */}

              <div className="product-contentcard">

                {/* =========================================
                    CATEGORY + BRAND
                ========================================= */}

                <div className="product-meta">

                  <span className="catName">
                    {resolvedCategory}
                  </span>

                  {brand && (
                    <span className="product-brand">
                      {brand}
                    </span>
                  )}

                </div>

                {/* =========================================
                    PRODUCT NAME
                ========================================= */}

                <Link
                  to={productLink}
                  className="ddproducts-name-link"
                >
                  <h2 className="ddproducts-name">
                    {name}
                  </h2>
                </Link>

                {/* =========================================
                    STOCK
                ========================================= */}

                <span
                  className={`product-stock ${
                    isOutOfStock
                      ? "product-stock--out"
                      : "product-stock--in"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : `In Stock (${stock})`}
                </span>

                {/* =========================================
                    RATING
                ========================================= */}

                <StarRating rating={rating} />

                {/* =========================================
                    PRICE
                ========================================= */}

                <div className="product-price-row">

                  {oldPrice > price &&
                    oldPrice > 0 && (
                      <span className="price-original">
                        ₹
                        {oldPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}

                  <span className="price-current">
                    ₹
                    {price.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  {discount && (
                    <span className="price-discount">
                      {discount}% off
                    </span>
                  )}

                </div>

                {/* =========================================
                    ADD TO CART
                ========================================= */}

                <button
                  type="button"
                  className="add-to-cart-btn"
                  disabled={isOutOfStock}
                  onClick={() => {

                    if (isOutOfStock) {
                      return;
                    }

                    addToCart({
                      ...product,
                      quantity: 1,
                    });

                    showToast(
                      `${name} added to cart!`
                    );
                  }}
                >
                  <i className="fa-solid fa-cart-shopping"></i>

                  {isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}

                </button>

              </div>
            </div>
          );
        })}

      </div>
    </>
  );
};