import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";

import api, { ASSET_BASE_URL } from "../../api.js";

import "./DetailsPage.css";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

import CategoriesFilter from "../filters/CategoriesPage";
import RelatedProductCard from "../listing/RelatedProductCard";

import { useFilters } from "../../../context/FilterContext";

export const SingleProductListing = () => {
  const { categoryName, productId } = useParams();

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const {
    minPrice,
    maxPrice,
    selectedBrands,
    selectedStock,
    sortOption,
  } = useFilters();

  const [products, setProducts] = useState([]);
  const [, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [inputValue, setInputValue] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  const [zoomPosition, setZoomPosition] = useState({
    x: 0,
    y: 0,
    visible: false,
  });

  // =====================================================
  // TOAST
  // =====================================================

  const [toast, setToast] = useState({
    visible: false,
    message: "",
  });

  const showToast = (message) => {
    setToast({
      visible: true,
      message,
    });

    setTimeout(() => {
      setToast({
        visible: false,
        message: "",
      });
    }, 2500);
  };

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
  // SANITIZE HTML
  // =====================================================

  const getSafeHtml = (html) => {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
      USE_PROFILES: {
        html: true,
      },
    });
  };

  // =====================================================
  // QUANTITY
  // =====================================================

  const plus = () => {
    const stock = Number(product?.stock || 0);

    setInputValue((prev) => {
      if (stock > 0 && prev >= stock) {
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

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const stock = Number(product?.stock || 0);

    if (Number.isNaN(value) || value < 1) {
      setInputValue(1);
      return;
    }

    if (stock > 0 && value > stock) {
      setInputValue(stock);
      return;
    }

    setInputValue(value);
  };

  // =====================================================
  // IMAGE ZOOM
  // =====================================================

  const handleMouseMove = (e) => {
    const {
      left,
      top,
      width,
      height,
    } = e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - left) / width) * 100;

    const y =
      ((e.clientY - top) / height) * 100;

    setZoomPosition({
      x,
      y,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setZoomPosition((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  // =====================================================
  // FETCH PRODUCT + CATEGORIES + PRODUCTS
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [
          productRes,
          categoriesRes,
          productsRes,
        ] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get("/categories"),
          api.get("/products"),
        ]);

        if (!isMounted) return;

        const productData =
          productRes?.data || null;

        const categoryData =
          Array.isArray(categoriesRes?.data)
            ? categoriesRes.data
            : [];

        const productsData =
          Array.isArray(productsRes?.data)
            ? productsRes.data
            : [];

        setProduct(productData);
        setCategories(categoryData);
        setProducts(productsData);

        // =================================================
        // INITIAL IMAGE
        // =================================================

        if (
          Array.isArray(productData?.images) &&
          productData.images.length > 0
        ) {
          setActiveImage(
            getImageUrl(
              productData.images[0]
            )
          );
        } else if (productData?.image) {
          setActiveImage(
            getImageUrl(
              productData.image
            )
          );
        } else {
          setActiveImage(null);
        }

      } catch (err) {
        console.error(
          "Error fetching product details:",
          err.response?.data ||
            err.message ||
            err
        );

        if (isMounted) {
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (productId) {
      fetchData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }

    const normalizedCategory =
      categoryName?.toLowerCase().trim();

    let categoryProducts = products.filter(
      (p) => {
        const currentCategory =
          p.category_name ||
          p.category?.name ||
          "";

        return (
          currentCategory
            .toLowerCase()
            .trim() === normalizedCategory
        );
      }
    );

    let updatedProducts =
      categoryProducts.filter((p) => {
        const price = Number(
          p.price || 0
        );

        return (
          price >= minPrice &&
          price <= maxPrice
        );
      });

    // =================================================
    // BRAND FILTER
    // =================================================

    if (selectedBrands.length > 0) {
      updatedProducts =
        updatedProducts.filter((p) => {
          let productBrand = null;

          if (
            typeof p.brand === "string"
          ) {
            productBrand = p.brand;
          } else if (
            p.brand &&
            typeof p.brand === "object"
          ) {
            productBrand =
              p.brand.name ||
              p.brand.brand_name ||
              null;
          } else {
            productBrand =
              p.brand_name ||
              p.brandName ||
              null;
          }

          return selectedBrands.includes(
            productBrand
          );
        });
    }

    // =================================================
    // STOCK FILTER
    // =================================================

    if (selectedStock === "in") {
      updatedProducts =
        updatedProducts.filter(
          (p) => Number(p.stock) > 0
        );
    } else if (
      selectedStock === "out"
    ) {
      updatedProducts =
        updatedProducts.filter(
          (p) => Number(p.stock) === 0
        );
    }

    // =================================================
    // SORT
    // =================================================

    if (
      sortOption ===
      "PriceLowToHigh"
    ) {
      updatedProducts.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (
      sortOption ===
      "PriceHighToLow"
    ) {
      updatedProducts.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortOption === "Release") {
      updatedProducts.sort(
        (a, b) =>
          new Date(
            b.createdAt ||
              b.created_at ||
              0
          ) -
          new Date(
            a.createdAt ||
              a.created_at ||
              0
          )
      );
    }

    setFilteredProducts(
      updatedProducts
    );
  }, [
    products,
    categoryName,
    minPrice,
    maxPrice,
    selectedBrands,
    selectedStock,
    sortOption,
  ]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="details-home">
        <div className="skeleton-wrapper">

          <div className="skeleton skeleton-image" />

          <div className="skeleton-info">

            <div className="skeleton skeleton-line w-70" />

            <div className="skeleton skeleton-line w-40" />

            <div className="skeleton skeleton-line w-50" />

            <div className="skeleton skeleton-line w-90" />

          </div>

        </div>
      </section>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!product) {
    return (
      <section className="details-home">
        <h2 className="not-found">
          Product not found!
        </h2>
      </section>
    );
  }

  // =====================================================
  // PRODUCT VALUES
  // =====================================================

  const productTitle =
    product.title ||
    product.name ||
    "Product";

  const productBrand =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name ||
        product.brand?.brand_name ||
        product.brand_name ||
        "—";

  const productCategory =
    product.category_name ||
    product.category?.name ||
    categoryName ||
    "—";

  const productPrice =
    product.discount_price ??
    product.price ??
    0;

  const productOldPrice =
    product.oldPrice ??
    product.old_price ??
    product.orgprice ??
    "";

  const productStock =
    Number(product.stock || 0);

  const productImages =
    Array.isArray(product.images)
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const safeDescription =
    getSafeHtml(
      product.description
    );

  // =====================================================
  // MATCHED CATEGORY
  // =====================================================

  const matchedCategory =
    categories.find((cat) => {
      const catName =
        cat.name || "";

      return (
        catName
          .toLowerCase()
          .trim() ===
        productCategory
          .toLowerCase()
          .trim()
      );
    });

  // =====================================================
  // RELATED PRODUCTS
  // =====================================================
  // Same category, excluding current product.
  // Maximum 6 products for the sidebar.
  // =====================================================

  const relatedProducts = products
    .filter((p) => {
      if (
        String(p.id) ===
        String(productId)
      ) {
        return false;
      }

      const currentCategory =
        p.category_name ||
        p.category?.name ||
        "";

      return (
        currentCategory
          .toLowerCase()
          .trim() ===
        productCategory
          .toLowerCase()
          .trim()
      );
    })
    .slice(0, 6);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="details-home">

      {/* =================================================
          TOAST
      ================================================= */}

      <div
        className={`toast ${
          toast.visible
            ? "toast-show"
            : ""
        }`}
      >
        {toast.message}
      </div>

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="breadcrumb-wrapper">

        <div className="container-fluid">

          <ul className="breadcrumb-content">

            <li>
              <Link to="/">
                Home
              </Link>
            </li>

            {matchedCategory && (
              <li>
                <Link
                  to={`/products-categories/${encodeURIComponent(
                    matchedCategory.name
                  )}`}
                >
                  {matchedCategory.name}
                </Link>
              </li>
            )}

            <li>
              <span>
                {productTitle}
              </span>
            </li>

          </ul>

        </div>

      </div>

      {/* =================================================
          MAIN PRODUCT AREA
      ================================================= */}

      <div className="detailspage-row">

        <div className="products-container">

          <div className="details-left">

            {/* =================================================
                PRODUCT IMAGES
            ================================================= */}

            <div className="producat_wrapper">

              <div
                className="detailshome-zoom-container"
                onMouseMove={
                  handleMouseMove
                }
                onMouseLeave={
                  handleMouseLeave
                }
              >

                {activeImage ? (
                  <img
                    key={activeImage}
                    src={activeImage}
                    alt={productTitle}
                    className="detailshome-main-image fade-in-image"
                  />
                ) : (
                  <div className="no-image">
                    No image available
                  </div>
                )}

                {zoomPosition.visible &&
                  activeImage && (
                    <div
                      className="detailshome-image-zoom-lens"
                      style={{
                        backgroundImage: `url("${activeImage}")`,
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  )}

              </div>

              {/* IMAGE GALLERY */}

              {productImages.length > 0 && (
                <div className="detailshome-image-gallery">

                  {productImages.map(
                    (img, idx) => {
                      const fullUrl =
                        getImageUrl(img);

                      if (!fullUrl) {
                        return null;
                      }

                      return (
                        <img
                          key={idx}
                          src={fullUrl}
                          alt={`${productTitle} ${
                            idx + 1
                          }`}
                          onClick={() =>
                            setActiveImage(
                              fullUrl
                            )
                          }
                          style={{
                            "--delay": `${
                              idx * 0.08
                            }s`,
                          }}
                          className={`gallery-thumb ${
                            activeImage ===
                            fullUrl
                              ? "detailshome-gallery-image"
                              : ""
                          }`}
                        />
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                PRODUCT DETAILS
            ================================================= */}

            <div className="product-details">

              <h1 className="product-title">
                {productTitle}
              </h1>

              <h2>
                <b>Brand: </b>
                {productBrand}
              </h2>

              {/* RATING */}

              <div className="product-rating">

                <span>
                  <i className="fas fa-star" />
                </span>

                <span>
                  <i className="fas fa-star" />
                </span>

                <span>
                  <i className="fas fa-star" />
                </span>

                <span>
                  <i className="fas fa-star" />
                </span>

                <span>
                  <i className="fas fa-star-half-alt" />
                </span>

                <span>
                  (350 ratings)
                </span>

              </div>

              {/* PRICING */}

              <div className="products-pricing">

                <b>Price: </b>

                {productOldPrice !== "" && (
                  <span className="original-price">
                    ₹{productOldPrice}
                  </span>
                )}

                <span className="discount-price">
                  ₹{productPrice}
                </span>

              </div>

              {/* ACTIONS */}

              <div className="product-actions">

                {/* QUANTITY */}

                <div className="product-quantity">

                  <span
                    className="qty-down"
                    onClick={minus}
                  >
                    <i className="fa-solid fa-chevron-down" />
                  </span>

                  <input
                    type="number"
                    value={inputValue}
                    onChange={
                      handleInputChange
                    }
                    min="1"
                    max={
                      productStock > 0
                        ? productStock
                        : undefined
                    }
                  />

                  <span
                    className="qty-up"
                    onClick={plus}
                  >
                    <i className="fa-solid fa-chevron-up" />
                  </span>

                </div>

                {/* SHORT DESCRIPTION */}

                {product.subdescription && (
                  <p>
                    <b>
                      {product.subdescription}
                    </b>
                  </p>
                )}

                {/* STOCK */}

                <p>
                  <b>Stock:</b>{" "}
                  {productStock > 0
                    ? `${productStock} Items In Stock`
                    : "Out of Stock"}
                </p>

                {/* BUTTONS */}

                <div className="product-details-button">

                  <button
                    type="button"
                    className="addtocart"
                    disabled={
                      productStock <= 0
                    }
                    onClick={() => {
                      addToCart({
                        ...product,
                        quantity:
                          inputValue,
                      });

                      showToast(
                        `${productTitle} added to cart!`
                      );
                    }}
                  >
                    <i className="fa-solid fa-cart-shopping" />{" "}
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    className="addtocart wishlist-btn"
                    onClick={() => {
                      addToWishlist({
                        ...product,
                        quantity: 1,
                        price:
                          productPrice,
                      });

                      showToast(
                        `${productTitle} added to wishlist!`
                      );
                    }}
                  >
                    ❤️ Wishlist
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FULL HTML DESCRIPTION / OVERVIEW
          ================================================= */}

          <div className="detailspage-descriptions-container">

            <h2>Overview</h2>

            <table>
              <tbody>

                <tr>
                  <td>
                    <b>Product Name</b>
                  </td>

                  <td>
                    {productTitle}
                  </td>
                </tr>

                <tr>
                  <td>
                    <b>Brand</b>
                  </td>

                  <td>
                    {productBrand}
                  </td>
                </tr>

                <tr>
                  <td>
                    <b>Category</b>
                  </td>

                  <td>
                    {productCategory}
                  </td>
                </tr>

              </tbody>
            </table>

            {/* ADMIN HTML DESCRIPTION */}

            {safeDescription && (
              <div
                className="product-html-description"
                dangerouslySetInnerHTML={{
                  __html:
                    safeDescription,
                }}
              />
            )}

            {/* ADDITIONAL PRODUCT INFORMATION */}

            <div className="product-details-summary">

              <ul>

                {product.type && (
                  <li>
                    <b>Type:</b>{" "}
                    {product.type}
                  </li>
                )}

                {product.mfg && (
                  <li>
                    <b>MFG:</b>{" "}
                    {product.mfg}
                  </li>
                )}

                {product.size && (
                  <li>
                    <b>Size:</b>{" "}
                    {product.size}
                  </li>
                )}

                {product.weight && (
                  <li>
                    <b>Weight:</b>{" "}
                    {product.weight}
                  </li>
                )}

                {product.tags && (
                  <li>
                    <b>Tags:</b>{" "}
                    {product.tags}
                  </li>
                )}

                {product.life && (
                  <li>
                    <b>Life:</b>{" "}
                    {product.life}
                  </li>
                )}

                <li>
                  <b>Stock:</b>{" "}
                  {productStock > 0
                    ? `${productStock} Items In Stock`
                    : "Out of Stock"}
                </li>

                {product.sku && (
                  <li>
                    <b>SKU:</b>{" "}
                    {product.sku}
                  </li>
                )}

              </ul>

            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <div className="categories-sidebar">

          {/* CATEGORIES */}

          <CategoriesFilter
            categories={categories}
            products={products}
          />

          {/* =================================================
              RELATED PRODUCTS
          ================================================= */}

          <div className="sidebar-category-card related-products-sidebar">

            <div className="related-products-sidebar-header">
              <h3>
                Related Products
              </h3>
            </div>

            <div className="related-products-sidebar-list">

              {relatedProducts.length > 0 ? (
                relatedProducts.map(
                  (relatedProduct) => (
                    <RelatedProductCard
                      key={relatedProduct.id}
                      product={
                        relatedProduct
                      }
                    />
                  )
                )
              ) : (
                <p className="no-related-products">
                  No related products
                  available
                </p>
              )}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};