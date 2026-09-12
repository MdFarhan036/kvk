import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";

import api, { ASSET_BASE_URL } from "../../api.js";

import "./DailyDeals.css";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

export const DailyDealsProductPage = () => {
  const { categoryName, productName } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] =
    useState("");

  const [inputValue, setInputValue] =
    useState(1);

  const [isPopupVisible, setIsPopupVisible] =
    useState(false);

  const { addToCart } = useCart();
  const { addToWishlist } =
    useWishlist();

  // =====================================================
  // IMAGE URL HELPER
  // =====================================================

  const getImageUrl = (url) => {
    if (!url) return "";

    if (typeof url !== "string") {
      return "";
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${ASSET_BASE_URL}${
      url.startsWith("/") ? "" : "/"
    }${url}`;
  };

  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get(
          `/daily-deals/${encodeURIComponent(
            categoryName || ""
          )}/${encodeURIComponent(
            productName || ""
          )}`
        );

        if (!isMounted) return;

        setProduct(data);

        // =================================================
        // INITIAL IMAGE
        // =================================================

        if (
          Array.isArray(data?.images) &&
          data.images.length > 0
        ) {
          setActiveImage(
            getImageUrl(data.images[0])
          );
        } else if (data?.image) {
          setActiveImage(
            getImageUrl(data.image)
          );
        } else {
          setActiveImage("");
        }

      } catch (err) {
        console.error(
          "Error fetching Daily Deal product:",
          err.response?.data ||
            err.message ||
            err
        );

        if (isMounted) {
          setError(
            "We couldn't find this product."
          );
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (categoryName && productName) {
      fetchProduct();
    } else {
      setLoading(false);
      setError(
        "Invalid product URL."
      );
    }

    return () => {
      isMounted = false;
    };
  }, [categoryName, productName]);

  // =====================================================
  // PRODUCT VALUES
  // =====================================================

  const productTitle =
    product?.title ||
    product?.name ||
    "Product";

  const productBrand =
    product?.brand || "";

  const productCategory =
    product?.category_name ||
    product?.category?.name ||
    categoryName ||
    "";

  const dealPrice =
    product?.daily_deal_price ??
    product?.discount_price ??
    product?.price ??
    0;

  const originalPrice =
    product?.orgprice ??
    product?.oldPrice ??
    product?.old_price ??
    "";

  const stock =
    Number(product?.stock ?? 0);

  const inStock =
    product?.stock === undefined ||
    product?.stock === null ||
    stock > 0;

  // =====================================================
  // DESCRIPTION
  // Admin stores HTML in `description`
  // =====================================================

  const description =
    product?.description || "";

  const cleanDescription =
    description
      ? DOMPurify.sanitize(
          description
        )
      : "";

  // =====================================================
  // PRODUCT IMAGES
  // =====================================================

  const productImages =
    Array.isArray(product?.images)
      ? product.images
          .map(getImageUrl)
          .filter(Boolean)
      : product?.image
      ? [getImageUrl(product.image)]
          .filter(Boolean)
      : [];

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    if (!product || !inStock) return;

    addToCart({
      ...product,
      id: product.id,
      title:
        product.title ||
        product.name,
      price: dealPrice,
      quantity: inputValue,
    });

    setIsPopupVisible(true);
  };

  // =====================================================
  // ADD TO WISHLIST
  // =====================================================

  const handleAddToWishlist = () => {
    if (!product) return;

    addToWishlist({
      ...product,
      id: product.id,
      title:
        product.title ||
        product.name,
      price: dealPrice,
      quantity: inputValue,
    });

    setIsPopupVisible(false);
  };

  // =====================================================
  // CLOSE POPUP
  // =====================================================

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  // =====================================================
  // QUANTITY
  // =====================================================

  const plus = () => {
    setInputValue((prev) => {
      if (
        inStock &&
        stock > 0 &&
        prev >= stock
      ) {
        return stock;
      }

      return prev + 1;
    });
  };

  const minus = () => {
    setInputValue((prev) =>
      prev > 1 ? prev - 1 : 1
    );
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(
      e.target.value,
      10
    );

    if (
      Number.isNaN(value) ||
      value < 1
    ) {
      setInputValue(1);
      return;
    }

    if (
      inStock &&
      stock > 0 &&
      value > stock
    ) {
      setInputValue(stock);
      return;
    }

    setInputValue(value);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="details-home">

        <div className="dailydeals-container">

          <div
            className="dd-skeleton-card"
            style={{
              height: 420,
            }}
          >
            <div
              className="dd-skeleton-img"
              style={{
                height: "100%",
              }}
            />
          </div>

        </div>

      </section>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (error || !product) {
    return (
      <section className="details-home">

        <div className="dailydeals-container">

          <div className="dd-empty-state">

            <strong>
              Product not found
            </strong>

            <span>
              {error ||
                "This product may no longer be available."}
            </span>

            <Link
              to="/daily-deals"
              className="dd-back-link"
            >
              Back to Daily Deals
            </Link>

          </div>

        </div>

      </section>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="details-home daily-deals">

      {/* =================================================
          BREADCRUMB / TITLE
      ================================================= */}

      <div className="breadcumbwrapper">

        <div className="container-fluid">

          <ul className="breadcumb-content">

            <li>
              <Link to="/">
                Home
              </Link>
            </li>

            <li>
              <Link to="/daily-deals">
                Daily Deals
              </Link>
            </li>

            {productCategory && (
              <li>
                <span>
                  {productCategory}
                </span>
              </li>
            )}

            <li>
              <h1>
                {productTitle}
              </h1>
            </li>

          </ul>

        </div>

      </div>

      {/* =================================================
          PRODUCT AREA
      ================================================= */}

      <div className="detailspage-row">

        <div className="detailspage-cont">

          <div className="details-left">

            {/* =================================================
                IMAGES
            ================================================= */}

            <div className="producat_wrapper">

              <div className="detailshome-main-image-container">

                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={productTitle}
                    className="detailshome-main-image"
                  />
                ) : (
                  <span className="no-image">
                    No image available
                  </span>
                )}

              </div>

              {/* =================================================
                  IMAGE GALLERY
              ================================================= */}

              {productImages.length > 0 && (
                <div className="detailshome-image-gallery">

                  {productImages.map(
                    (img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${productTitle} thumbnail ${
                          idx + 1
                        }`}
                        className={
                          activeImage === img
                            ? "detailshomeimageactive"
                            : ""
                        }
                        onClick={() =>
                          setActiveImage(
                            img
                          )
                        }
                      />
                    )
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                PRODUCT DETAILS
            ================================================= */}

            <div className="product-details">

              <h1>
                {productTitle}
              </h1>

              {/* =================================================
                  BRAND
              ================================================= */}

              {productBrand && (
                <h2>
                  <b>Brand: </b>
                  {productBrand}
                </h2>
              )}

              {/* =================================================
                  CATEGORY
              ================================================= */}

              {productCategory && (
                <p>
                  <b>Category:</b>{" "}
                  {productCategory}
                </p>
              )}

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              {cleanDescription && (
                <div
                  className="product-description-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      cleanDescription,
                  }}
                />
              )}

              {/* =================================================
                  PRICE
              ================================================= */}

              <div className="products-pricing">

                {originalPrice !== "" && (
                  <span className="old-price">
                    ₹{originalPrice}
                  </span>
                )}

                <span className="discount-price">
                  ₹{dealPrice}
                </span>

              </div>

              {/* =================================================
                  STOCK
              ================================================= */}

              <div className="daily-deal-stock">

                {inStock ? (
                  <span>
                    {stock > 0
                      ? `${stock} Items In Stock`
                      : "In Stock"}
                  </span>
                ) : (
                  <span>
                    Out of Stock
                  </span>
                )}

              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <div className="product-quantity">

                <button
                  type="button"
                  onClick={minus}
                  aria-label="Decrease quantity"
                  disabled={
                    !inStock
                  }
                >
                  -
                </button>

                <input
                  type="number"
                  value={inputValue}
                  onChange={
                    handleQuantityChange
                  }
                  min="1"
                  max={
                    stock > 0
                      ? stock
                      : undefined
                  }
                  aria-label="Quantity"
                  disabled={
                    !inStock
                  }
                />

                <button
                  type="button"
                  onClick={plus}
                  aria-label="Increase quantity"
                  disabled={
                    !inStock
                  }
                >
                  +
                </button>

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="product-details-button">

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={!inStock}
                >
                  {inStock
                    ? "Add to Cart"
                    : "Out of Stock"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleAddToWishlist
                  }
                  disabled={!product}
                >
                  Add to Wishlist
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              FULL DESCRIPTION
          ================================================= */}

          {cleanDescription && (
            <div className="detailspage-descriptions-container">

              <h2>
                Product Description
              </h2>

              <div
                className="product-html-description"
                dangerouslySetInnerHTML={{
                  __html:
                    cleanDescription,
                }}
              />

            </div>
          )}

        </div>

        {/* =================================================
            CART POPUP
        ================================================= */}

        {isPopupVisible && (
          <div
            className="popup"
            onClick={
              handleClosePopup
            }
          >

            <div
              className="popup-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <p>
                {productTitle} has been
                added to your cart.
              </p>

              <button
                type="button"
                onClick={
                  handleClosePopup
                }
              >
                OK
              </button>

            </div>

          </div>
        )}

      </div>

    </section>
  );
};