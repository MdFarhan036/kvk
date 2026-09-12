import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../../api.js";
import { useFilters } from "../../../FilterContext";
import { FilterPage } from "../FilterPage";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

import DOMPurify from "dompurify";

export const FeatureCategoriesPage = () => {
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
  const [brands, setBrands] = useState([]);

  const [stockSummary, setStockSummary] = useState({
    inStock: 0,
    outStock: 0,
  });

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [inputValue, setInputValue] = useState(1);

  const [activeImage, setActiveImage] = useState(null);

  const [zoomPosition, setZoomPosition] = useState({
    x: 0,
    y: 0,
    visible: false,
  });

  // =========================================================
  // IMAGE URL HELPER
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // =========================================================
  // QUANTITY HANDLERS
  // =========================================================

  const plus = () => {
    setInputValue((prev) => prev + 1);
  };

  const minus = () => {
    setInputValue((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);

    setInputValue(Number.isNaN(value) || value < 1 ? 1 : value);
  };

  // =========================================================
  // ZOOM HANDLERS
  // =========================================================

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

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

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          productRes,
          categoriesRes,
          productsRes,
          brandsRes,
          stockRes,
        ] = await Promise.all([
          api.get(`/products/${productId}`),

          api.get("/categories"),

          api.get("/products"),

          api.get(
            `/brands/${encodeURIComponent(categoryName || "")}`
          ),

          api.get(
            `/stock/${encodeURIComponent(categoryName || "")}`
          ),
        ]);

        // -----------------------------------------------------
        // PRODUCT
        // -----------------------------------------------------

        const productData = productRes.data;

        setProduct(productData);

        if (productData?.images?.length) {
          setActiveImage(getImageUrl(productData.images[0]));
        } else if (productData?.image) {
          setActiveImage(getImageUrl(productData.image));
        } else {
          setActiveImage(null);
        }

        // -----------------------------------------------------
        // CATEGORIES
        // -----------------------------------------------------

        setCategories(
          Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : []
        );

        // -----------------------------------------------------
        // PRODUCTS
        // -----------------------------------------------------

        setProducts(
          Array.isArray(productsRes.data)
            ? productsRes.data
            : []
        );

        // -----------------------------------------------------
        // BRANDS
        // -----------------------------------------------------

        setBrands(
          Array.isArray(brandsRes.data)
            ? brandsRes.data
            : []
        );

        // -----------------------------------------------------
        // STOCK
        // -----------------------------------------------------

        setStockSummary(
          stockRes.data || {
            inStock: 0,
            outStock: 0,
          }
        );
      } catch (err) {
        console.error("Failed to load feature category product:", err);

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [categoryName, productId]);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }

    const currentCategory = (categoryName || "")
      .toLowerCase()
      .trim();

    let categoryProducts = products.filter((p) => {
      const productCategory =
        p.category_name ||
        p.category?.name ||
        "";

      return (
        productCategory.toLowerCase().trim() ===
        currentCategory
      );
    });

    let updatedProducts = categoryProducts.filter((p) => {
      const price = Number(
        p.discount_price ??
          p.price ??
          0
      );

      return price >= minPrice && price <= maxPrice;
    });

    // ---------------------------------------------------------
    // BRAND FILTER
    // ---------------------------------------------------------

    if (selectedBrands.length > 0) {
      updatedProducts = updatedProducts.filter((p) => {
        const brand =
          typeof p.brand === "object"
            ? p.brand?.name
            : p.brand;

        return selectedBrands.includes(brand);
      });
    }

    // ---------------------------------------------------------
    // STOCK FILTER
    // ---------------------------------------------------------

    if (selectedStock === "in") {
      updatedProducts = updatedProducts.filter(
        (p) => Number(p.stock) > 0
      );
    } else if (selectedStock === "out") {
      updatedProducts = updatedProducts.filter(
        (p) => Number(p.stock) === 0
      );
    }

    // ---------------------------------------------------------
    // SORT
    // ---------------------------------------------------------

    if (sortOption === "PriceLowToHigh") {
      updatedProducts.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortOption === "PriceHighToLow") {
      updatedProducts.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortOption === "Release") {
      updatedProducts.sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
      );
    }

    setFilteredProducts(updatedProducts);
  }, [
    products,
    categoryName,
    minPrice,
    maxPrice,
    selectedBrands,
    selectedStock,
    sortOption,
  ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return <h2>Loading product details...</h2>;
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!product) {
    return <h2>Product not found!</h2>;
  }

  // =========================================================
  // PRODUCT DATA
  // =========================================================

  const productTitle =
    product.title ||
    product.name ||
    "Product";

  const productBrand =
    typeof product.brand === "object"
      ? product.brand?.name
      : product.brand;

  const productCategory =
    product.category_name ||
    product.category?.name ||
    categoryName ||
    "";

  const productImages =
    Array.isArray(product.images)
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const originalPrice =
    product.oldPrice ??
    product.old_price ??
    product.original_price ??
    0;

  const sellingPrice =
    product.discount_price ??
    product.price ??
    0;

  const safeDescription = DOMPurify.sanitize(
    product.description || ""
  );

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <section className="details-home">

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="breadcrumb-wrapper">
        <div className="container-fluid">

          <ul className="breadcrumb-content">

            <li>
              <Link to="/">Home</Link>
            </li>

            {categories
              .filter((cat) => {
                const name = cat?.name || "";

                return (
                  name.toLowerCase().trim() ===
                  (categoryName || "")
                    .toLowerCase()
                    .trim()
                );
              })
              .map((cat) => (
                <li key={cat.id}>

                  <Link
                    to={`/products-categories/${encodeURIComponent(
                      cat.name
                    )}`}
                  >
                    {cat.name
                      ?.charAt(0)
                      .toUpperCase() +
                      cat.name?.slice(1)}
                  </Link>

                </li>
              ))}

            <li>
              <span>{productTitle}</span>
            </li>

          </ul>

        </div>
      </div>

      {/* =====================================================
          MAIN PAGE
      ===================================================== */}

      <div className="detailspage-row">

        {/* ===================================================
            LEFT COLUMN
        =================================================== */}

        <div>

          <div className="details-left">

            {/* ===============================================
                PRODUCT IMAGE SECTION
            =============================================== */}

            <div className="producat_wrapper">

              <div
                className="detailshome-zoom-container"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >

                {activeImage && (
                  <img
                    src={activeImage}
                    alt={productTitle}
                    className="detailshome-main-image"
                  />
                )}

                {zoomPosition.visible &&
                  activeImage && (
                    <div
                      className="detailshome-image-zoom-lens"
                      style={{
                        backgroundImage: `url(${activeImage})`,
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  )}

              </div>

              {/* =============================================
                  IMAGE GALLERY
              ============================================= */}

              {productImages.length > 0 && (
                <div className="detailshome-image-gallery">

                  {productImages.map((img, idx) => {
                    const imageUrl = getImageUrl(img);

                    return (
                      <img
                        key={idx}
                        src={imageUrl}
                        alt={`Product ${idx + 1}`}
                        onClick={() =>
                          setActiveImage(imageUrl)
                        }
                        className={
                          activeImage === imageUrl
                            ? "detailshome-gallery-image"
                            : ""
                        }
                      />
                    );
                  })}

                </div>
              )}

            </div>

            {/* ===============================================
                PRODUCT INFORMATION
            =============================================== */}

            <div className="product-details">

              <h1 className="product-title">
                {productTitle}
              </h1>

              <h2>
                <b>Brand: </b>
                {productBrand || "N/A"}
              </h2>

              <div className="product-rating">

                <span>
                  <i className="fas fa-star"></i>
                </span>

                <span>
                  <i className="fas fa-star"></i>
                </span>

                <span>
                  <i className="fas fa-star"></i>
                </span>

                <span>
                  <i className="fas fa-star"></i>
                </span>

                <span>
                  <i className="fas fa-star-half-alt"></i>
                </span>

                <span>(350 ratings)</span>

              </div>

              {/* =============================================
                  PRICING
              ============================================= */}

              <div className="products-pricing">

                <b>Price: </b>

                {originalPrice > 0 && (
                  <span className="original-price">
                    ₹{originalPrice}
                  </span>
                )}

                <span className="discount-price">
                  ₹{sellingPrice}
                </span>

              </div>

              {/* =============================================
                  PRODUCT ACTIONS
              ============================================= */}

              <div className="product-actions">

                <div className="product-quantity">

                  <span
                    className="qty-down"
                    onClick={minus}
                  >
                    <i className="fa-solid fa-chevron-down"></i>
                  </span>

                  <input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    min="1"
                  />

                  <span
                    className="qty-up"
                    onClick={plus}
                  >
                    <i className="fa-solid fa-chevron-up"></i>
                  </span>

                </div>

                <div className="product-details-button">

                  {/* ADD TO CART */}

                  <button
                    className="add-to-cart"
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        title: productTitle,
                        price: sellingPrice,
                        quantity: inputValue,
                      });

                      alert(
                        `${productTitle} added to cart!`
                      );
                    }}
                  >
                    Add to Cart
                  </button>

                  {/* BUY NOW */}

                  <button
                    className="buy-now"
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        title: productTitle,
                        price: sellingPrice,
                        quantity: inputValue,
                      });

                      alert(
                        `Proceeding to checkout with ${productTitle}`
                      );
                    }}
                  >
                    Buy Now
                  </button>

                  {/* WISHLIST */}

                  <button
                    className="add-to-cart"
                    onClick={() => {
                      addToWishlist({
                        id: product.id,
                        title: productTitle,
                        price: sellingPrice,
                        quantity: 1,
                      });

                      alert(
                        `${productTitle} added to wishlist!`
                      );
                    }}
                  >
                    Wishlist
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              PRODUCT OVERVIEW
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
                    {productBrand || "N/A"}
                  </td>
                </tr>

                <tr>
                  <td>
                    <b>Category</b>
                  </td>

                  <td>
                    {productCategory || "N/A"}
                  </td>
                </tr>

                <tr>
                  <td colSpan="2">

                    <div className="product-details-summary">

                      <ul>

                        {safeDescription && (
                          <li>
                            <b>Description:</b>

                            <div
                              className="product-html-description"
                              dangerouslySetInnerHTML={{
                                __html: safeDescription,
                              }}
                            />
                          </li>
                        )}

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

                          {Number(product.stock) > 0
                            ? `${product.stock} Items In Stock`
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

                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

        {/* =====================================================
            RIGHT FILTER SIDEBAR
        ===================================================== */}

        <FilterPage
          categories={categories}
          products={products}
          brands={brands}
          stockSummary={stockSummary}
          isFilterVisible={isFilterVisible}
          setIsFilterVisible={setIsFilterVisible}
        />

      </div>

    </section>
  );
};