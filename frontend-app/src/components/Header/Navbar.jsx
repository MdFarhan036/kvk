import { useState, useEffect } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api";

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  /* =========================================================
     FETCH CATEGORIES + PRODUCTS
  ========================================================= */

  useEffect(() => {
    const fetchMegaMenuData = async () => {
      try {
        const [categoriesRes, productsRes] =
          await Promise.all([
            api.get("/categories"),
            api.get("/products"),
          ]);

        const categoryData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : Array.isArray(categoriesRes.data?.data)
            ? categoriesRes.data.data
            : [];

        const productData = Array.isArray(productsRes.data)
          ? productsRes.data
          : Array.isArray(productsRes.data?.data)
            ? productsRes.data.data
            : Array.isArray(productsRes.data?.products)
              ? productsRes.data.products
              : [];

        setCategories(categoryData);
        setProducts(productData);

        if (categoryData.length > 0) {
          setSelectedCategory(categoryData[0]);
        }
      } catch (error) {
        console.error("Mega menu data error:", error);
      }
    };

    fetchMegaMenuData();
  }, []);

  /* =========================================================
     IMAGE URL
  ========================================================= */

  const getImageUrl = (image) => {
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${image.startsWith("/") ? "" : "/"
      }${image}`;
  };

  /* =========================================================
     PRODUCT HELPERS
  ========================================================= */

  const getProductId = (product) => {
    return product?.id || product?.product_id;
  };

  const getProductName = (product) => {
    return (
      product?.product_name ||
      product?.name ||
      product?.title ||
      "Product"
    );
  };

  const getProductPrice = (product) => {
    return (
      product?.sale_price ??
      product?.selling_price ??
      product?.discount_price ??
      product?.price ??
      0
    );
  };

  const getProductImage = (product) => {
    if (!product) return null;

    if (product.image) return product.image;
    if (product.image_url) return product.image_url;
    if (product.product_image) return product.product_image;
    if (product.thumbnail) return product.thumbnail;

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = product.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      return (
        firstImage?.image_url ||
        firstImage?.image ||
        firstImage?.url ||
        null
      );
    }

    return null;
  };

  /* =========================================================
     CATEGORY HELPERS
  ========================================================= */

  const getCategoryId = (category) => {
    return category?.id || category?.category_id;
  };

  const getCategoryName = (category) => {
    return (
      category?.name ||
      category?.category_name ||
      "Category"
    );
  };

  /* =========================================================
     MATCH PRODUCTS TO CATEGORY
  ========================================================= */

  const getProductsForCategory = (category) => {
    if (!category) {
      return [];
    }

    const categoryId = getCategoryId(category);

    const categoryName = getCategoryName(category)
      .trim()
      .toLowerCase();

    return products
      .filter((product) => {
        const productCategoryId =
          product?.category_id ??
          product?.categoryId ??
          product?.category?.id;

        const productCategoryName = (
          product?.category_name ||
          product?.category?.name ||
          ""
        )
          .trim()
          .toLowerCase();

        if (
          categoryId !== undefined &&
          categoryId !== null &&
          String(productCategoryId) === String(categoryId)
        ) {
          return true;
        }

        if (
          productCategoryName &&
          productCategoryName === categoryName
        ) {
          return true;
        }

        return false;
      })
      .slice(0, 6);
  };

  /* =========================================================
     GROUP CATEGORIES BY TYPE
  ========================================================= */

  const groupedCategories = categories.reduce(
    (acc, category) => {
      const type =
        category?.type ||
        category?.category_type ||
        "Shop";

      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push(category);

      return acc;
    },
    {}
  );

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileShopOpen(false);
    setMobilePagesOpen(false);
  };

  /* =========================================================
     CATEGORY HOVER
  ========================================================= */

  const handleCategoryHover = (category) => {
    setSelectedCategory(category);
  };

  /* =========================================================
     SELECTED PRODUCTS
  ========================================================= */

  const selectedProducts =
    getProductsForCategory(selectedCategory);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          MOBILE TOGGLE
      ===================================================== */}

      <button
        type="button"
        className="mobile-toggle"
        onClick={() =>
          setMobileMenuOpen((prev) => !prev)
        }
      >
        ☰
      </button>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav
        className={`main-nav ${mobileMenuOpen ? "open" : ""
          }`}
      >
        <ul>

          {/* =================================================
              HOME
          ================================================= */}

          <li className="nav-item">
            <Link
              to="/"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
          </li>


          {/* =================================================
              SHOP
          ================================================= */}

          <li
            className={`nav-item dropdown shop-dropdown ${mobileShopOpen ? "open" : ""
              }`}
            onClick={() => {
              if (window.innerWidth <= 900) {
                setMobileShopOpen((prev) => !prev);
              }
            }}
          >
            <span>Shop</span>

            <div className="mega-dropdown mega-shop-dropdown">

              <div className="mega-shop-layout">

                {/* =================================================
                    LEFT CATEGORY SIDEBAR
                ================================================= */}

                <div className="mega-category-sidebar">

                  <div className="mega-sidebar-title">
                    Categories
                  </div>

                  <div className="mega-sidebar-list">

                    {Object.entries(
                      groupedCategories
                    ).map(
                      ([type, typeCategories]) => (
                        <div
                          className="mega-category-group"
                          key={type}
                        >

                          <div className="mega-category-group-title">
                            {type}
                          </div>

                          {typeCategories.map(
                            (category) => {
                              const categoryId =
                                getCategoryId(category);

                              const isActive =
                                selectedCategory &&
                                String(
                                  getCategoryId(
                                    selectedCategory
                                  )
                                ) ===
                                String(categoryId);

                              return (
                                <Link
                                  key={
                                    categoryId ||
                                    getCategoryName(category)
                                  }
                                  to={`/products-categories/${encodeURIComponent(
                                    getCategoryName(category)
                                  )}`}
                                  className={`mega-category-link ${isActive
                                      ? "active"
                                      : ""
                                    }`}
                                  onMouseEnter={() =>
                                    handleCategoryHover(
                                      category
                                    )
                                  }
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    closeMobileMenu();
                                  }}
                                >
                                  <span>
                                    {getCategoryName(
                                      category
                                    )}
                                  </span>

                                  <span className="mega-category-arrow">
                                    →
                                  </span>
                                </Link>
                              );
                            }
                          )}

                        </div>
                      )
                    )}

                  </div>
                </div>


                {/* =================================================
                    RIGHT PRODUCTS PANEL
                ================================================= */}

                <div className="mega-products-panel">

                  <div className="mega-products-header">

                    <div>
                      <div className="mega-products-label">
                        PRODUCTS
                      </div>

                      <h3>
                        {selectedCategory
                          ? getCategoryName(
                            selectedCategory
                          )
                          : "Products"}
                      </h3>
                    </div>

                    {selectedCategory && (
                      <Link
                        to={`/products-categories/${encodeURIComponent(
                          getCategoryName(
                            selectedCategory
                          )
                        )}`}
                        className="mega-products-view-all"
                        onClick={(event) => {
                          event.stopPropagation();
                          closeMobileMenu();
                        }}
                      >
                        View All →
                      </Link>
                    )}

                  </div>


                  {/* =================================================
                      PRODUCTS
                  ================================================= */}

                  {selectedProducts.length > 0 ? (
                    <div className="mega-products-grid">

                      {selectedProducts.map(
                        (product) => {
                          const productId =
                            getProductId(product);

                          const image =
                            getImageUrl(
                              getProductImage(product)
                            );

                          const name =
                            getProductName(product);

                          const price =
                            getProductPrice(product);

                          return (
                            <Link
                              key={productId || name}
                              to={`/products-categories/${encodeURIComponent(
                                getCategoryName(selectedCategory)
                              )}`}
                              className="mega-product-card"
                              onClick={(event) => {
                                event.stopPropagation();
                                closeMobileMenu();
                              }}
                            >

                              <div className="mega-product-image">

                                {image ? (
                                  <img
                                    src={image}
                                    alt={name}
                                  />
                                ) : (
                                  <div className="mega-product-placeholder">
                                    No Image
                                  </div>
                                )}

                              </div>

                              <div className="mega-product-info">

                                <div className="mega-product-name">
                                  {name}
                                </div>

                                <div className="mega-product-price">
                                  ₹
                                  {Number(
                                    price || 0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </div>

                              </div>

                            </Link>
                          );
                        }
                      )}

                    </div>
                  ) : (
                    <div className="mega-no-products">
                      No products available
                      in this category.
                    </div>
                  )}

                </div>

              </div>
            </div>
          </li>


          {/* =================================================
              BLOG
          ================================================= */}

          <li className="nav-item">
            <Link
              to="/blogs"
              onClick={closeMobileMenu}
            >
              Blog
            </Link>
          </li>


          {/* =================================================
              PAGES
          ================================================= */}

          <li
            className={`nav-item dropdown ${mobilePagesOpen ? "open" : ""
              }`}
            onClick={() => {
              if (window.innerWidth <= 900) {
                setMobilePagesOpen((prev) => !prev);
              }
            }}
          >

            <span>Pages</span>

            <div className="mega-dropdown single-column pages-dropdown">

              <div className="dropdown-item">
                <Link
                  to="/about"
                  onClick={closeMobileMenu}
                >
                  About Us
                </Link>
              </div>

              <div className="dropdown-item">
                <Link
                  to="/brands"
                  onClick={closeMobileMenu}
                >
                  Brands
                </Link>
              </div>

              <div className="dropdown-item">
                <Link
                  to="/contact"
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </div>

              <div className="dropdown-item">
                <Link
                  to="/account/profile"
                  onClick={closeMobileMenu}
                >
                  My Account
                </Link>
              </div>

              <div className="dropdown-item">
                <Link
                  to="/orders"
                  onClick={closeMobileMenu}
                >
                  My Orders
                </Link>
              </div>

            </div>
          </li>


          {/* =================================================
              CONTACT
          ================================================= */}

          <li className="nav-item">
            <Link
              to="/contact"
              onClick={closeMobileMenu}
            >
              Contact
            </Link>
          </li>

        </ul>
      </nav>
    </>
  );
};

export default Navbar;