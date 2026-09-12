import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../../api.js";

import wishlistimg from "../../../assets/img/wishlist.png";
import previewimg from "../../../assets/img/eyeicon.jpg";

import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

import "./DailyDeals.css";

/* =========================================================
   HELPERS
========================================================= */

const getImageUrl = (url) => {
  if (!url) return null;

  // Already a complete URL
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${ASSET_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
};

const formatRupees = (value) =>
  Number(value || 0).toLocaleString("en-IN");

/* =========================================================
   DAILY DEALS CARD
========================================================= */

export const DailyDealsCard = ({
  ddproduct,
  isAdmin,
  openDailyDealModal,
  onToast,
}) => {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [imgError, setImgError] = useState(false);

  const notify =
    onToast ||
    ((msg) => window.alert(msg));

  /* =======================================================
     PRODUCT DATA
  ======================================================= */

  const {
    id,
    title,
    name,
    images,
    category_name,
    brand,
    stock,
    orgprice,
    price,
    daily_deal_price,
  } = ddproduct || {};

  const displayName =
    title ||
    name ||
    "Untitled product";

  const inStock =
    Number(stock) > 0;

  const productLink = `/products-categories/${
    encodeURIComponent(
      category_name || "unknown"
    )
  }/${id}`;

  const finalPrice =
    daily_deal_price || price;

  /* =======================================================
     DISCOUNT PERCENTAGE
  ======================================================= */

  const discountPercent = useMemo(() => {
    const original = Number(orgprice);
    const current = Number(finalPrice);

    if (
      !original ||
      !current ||
      original <= current
    ) {
      return null;
    }

    return Math.round(
      ((original - current) /
        original) *
        100
    );
  }, [orgprice, finalPrice]);

  /* =======================================================
     SAFETY
  ======================================================= */

  if (!ddproduct) {
    return null;
  }

  /* =======================================================
     IMAGE
  ======================================================= */

  const imageSrc =
    images && images[0]
      ? getImageUrl(images[0])
      : null;

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      ...ddproduct,
      quantity: 1,
    });

    notify(
      `${displayName} added to cart!`
    );
  };

  /* =======================================================
     ADD TO WISHLIST
  ======================================================= */

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToWishlist({
      ...ddproduct,
      quantity: 1,
    });

    notify(
      `${displayName} added to wishlist!`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="product-card">

      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="product-imgcard">

        {discountPercent && (
          <span className="deal-ribbon">
            -{discountPercent}%
          </span>
        )}

        {imageSrc && !imgError ? (
          <img
            className="product-image"
            src={imageSrc}
            alt={displayName}
            loading="lazy"
            onError={() =>
              setImgError(true)
            }
          />
        ) : (
          <span className="no-image">
            No image
          </span>
        )}

        {/* =================================================
            QUICK PREVIEW
        ================================================= */}

        <div className="img_overlay">

          <ul className="list-product-overlay">

            <Link
              to={productLink}
              aria-label={`Preview ${displayName}`}
            >
              <li className="list-item-overlay">

                <img
                  src={previewimg}
                  alt=""
                />

              </li>
            </Link>

          </ul>

        </div>

        {/* =================================================
            WISHLIST
        ================================================= */}

        <button
          type="button"
          className="wishlist-icon"
          onClick={handleAddToWishlist}
          aria-label={`Add ${displayName} to wishlist`}
        >
          <img
            src={wishlistimg}
            alt=""
          />
        </button>

      </div>

      {/* =================================================
          PRODUCT DETAILS
      ================================================= */}

      <div className="ddproduct-contentcard">

        {/* CATEGORY */}

        {category_name && (
          <span className="catName">
            {category_name}
          </span>
        )}

        {/* PRODUCT NAME */}

        <Link to={productLink}>
          <h2 className="ddproducts-name">
            {displayName}
          </h2>
        </Link>

        {/* BRAND */}

        {brand && (
          <h4>
            {brand}
          </h4>
        )}

        {/* STOCK */}

        <h5>
          <span
            className={`stock-dot ${
              inStock ? "" : "out"
            }`}
          />

          {inStock
            ? `In stock (${stock})`
            : "Out of stock"}
        </h5>

        {/* =================================================
            RATINGS
        ================================================= */}

        <div
          className="product-ratings"
          aria-hidden="true"
        >
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <span
                key={star}
                className={`fa fa-star${
                  star <=
                  (ddproduct.rating || 3)
                    ? " checked"
                    : ""
                }`}
              />
            )
          )}
        </div>

        {/* =================================================
            PRICE
        ================================================= */}

        <div className="price">

          {orgprice && (
            <span className="original-price">
              ₹{formatRupees(orgprice)}
            </span>
          )}

          <span className="discount-price">
            ₹{formatRupees(finalPrice)}
          </span>

        </div>

        {/* =================================================
            ADD TO CART
        ================================================= */}

        <button
          className="addtocart"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <i
            className="fa-solid fa-cart-shopping"
            aria-hidden="true"
          />

          {inStock
            ? "Add to cart"
            : "Out of stock"}
        </button>

        {/* =================================================
            ADMIN DAILY DEAL
        ================================================= */}

        {isAdmin && (
          <label className="dd-admin-row">

            <input
              type="checkbox"
              checked={
                ddproduct.is_daily_deal === 1
              }
              onChange={() =>
                openDailyDealModal &&
                openDailyDealModal(
                  ddproduct
                )
              }
            />

            Daily deal

          </label>
        )}

      </div>

    </div>
  );
};