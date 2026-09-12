import { useState } from "react";
import { Link } from "react-router-dom";

import { ASSET_BASE_URL } from "../../api.js";

import wishlistimg from "../../../assets/img/wishlist.png";
import previewimg from "../../../assets/img/eyeicon.jpg";

import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

const getImageUrl = (url) => {
  if (!url) return null;

  if (typeof url !== "string") return null;

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${ASSET_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
};

const formatRupees = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const RelatedProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [imgError, setImgError] =
    useState(false);

  if (!product) return null;

  // =========================================
  // PRODUCT DATA
  // =========================================

  const productId = product.id;

  const displayName =
    product.title ||
    product.name ||
    "Untitled product";

  const categoryName =
    product.category_name ||
    product.category?.name ||
    "";

  const brand =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name ||
        product.brand?.brand_name ||
        product.brand_name ||
        "";

  const stock = Number(
    product.stock || 0
  );

  const inStock = stock > 0;

  const originalPrice =
    product.oldPrice ??
    product.old_price ??
    product.original_price ??
    product.orgprice ??
    0;

  const finalPrice =
    product.price ??
    product.discount_price ??
    product.disprice ??
    0;

  const rating = Number(
    product.rating || 3
  );

  // =========================================
  // IMAGE
  // =========================================

  const imageSrc =
    product.images?.[0]
      ? getImageUrl(product.images[0])
      : product.image
      ? getImageUrl(product.image)
      : null;

  // =========================================
  // PRODUCT LINK
  // =========================================

  const productLink = categoryName
    ? `/products-categories/${encodeURIComponent(
        categoryName
      )}/${productId}`
    : `/product/${productId}`;

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) return;

    addToCart({
      ...product,
      quantity: 1,
    });
  };

  // =========================================
  // WISHLIST
  // =========================================

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToWishlist({
      ...product,
      quantity: 1,
    });
  };

  return (
    <div className="related-product-card">

      {/* IMAGE */}

      <div className="related-product-imgcard">

        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt={displayName}
            loading="lazy"
            onError={() =>
              setImgError(true)
            }
          />
        ) : (
          <span className="related-no-image">
            No image
          </span>
        )}

        {/* PREVIEW */}

        <div className="related-img-overlay">
          <Link
            to={productLink}
            aria-label={`Preview ${displayName}`}
          >
            <img
              src={previewimg}
              alt=""
            />
          </Link>
        </div>

        {/* WISHLIST */}

        <button
          type="button"
          className="related-wishlist-icon"
          onClick={
            handleAddToWishlist
          }
          aria-label={`Add ${displayName} to wishlist`}
        >
          <img
            src={wishlistimg}
            alt=""
          />
        </button>

      </div>

      {/* PRODUCT DETAILS */}

      <div className="related-product-content">

        {/* CATEGORY */}

        {categoryName && (
          <span className="related-catName">
            {categoryName}
          </span>
        )}

        {/* NAME */}

        <Link to={productLink}>
          <h3 className="related-product-name">
            {displayName}
          </h3>
        </Link>

        {/* BRAND */}

        {brand && (
          <h4 className="related-product-brand">
            {brand}
          </h4>
        )}

        {/* STOCK */}

        <h5 className="related-product-stock">

          <span
            className={`related-stock-dot ${
              inStock ? "" : "out"
            }`}
          />

          {inStock
            ? `In stock (${stock})`
            : "Out of stock"}

        </h5>

        {/* RATING */}

        <div
          className="product-ratings"
          aria-hidden="true"
        >
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <span
                key={star}
                className={`fa fa-star${
                  star <= rating
                    ? " checked"
                    : ""
                }`}
              />
            )
          )}
        </div>

        {/* PRICE */}

        <div className="price">

          {Number(originalPrice) !==
            Number(finalPrice) && (
            <span className="original-price">
              ₹
              {formatRupees(
                originalPrice
              )}
            </span>
          )}

          <span className="discount-price">
            ₹
            {formatRupees(
              finalPrice
            )}
          </span>

        </div>

        {/* ADD TO CART */}

        <button
          type="button"
          className="addtocart related-addtocart"
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

      </div>
    </div>
  );
};

export default RelatedProductCard;