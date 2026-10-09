import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Topbar } from "./Topbar";
import Navbar from "./Navbar";
import "./Header.css";

import logonav from "../../assets/img/kvklogo1.png";

import api, { ASSET_BASE_URL } from "../api.js";
import { useCustomerAuth } from "../../context/CustomerContext";
import { Loader } from "../Loader";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t } = useTranslation();
  // ============================================
  // STATE
  // ============================================

  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navigate = useNavigate();

  const {
    customer,
    logout,
    loading,
  } = useCustomerAuth();


  // ============================================
  // FETCH CART
  // ============================================

  useEffect(() => {
    const fetchCart = async () => {
      if (!customer) {
        setCartItems([]);
        return;
      }

      try {
        const { data } = await api.get("/cart");

        setCartItems(
          Array.isArray(data)
            ? data
            : data?.items ||
              data?.cart ||
              []
        );
      } catch (error) {
        console.error(
          "Error fetching cart:",
          error
        );

        setCartItems([]);
      }
    };

    fetchCart();
  }, [customer]);


  // ============================================
  // FETCH WISHLIST
  // ============================================

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!customer) {
        setWishlistItems([]);
        return;
      }

      try {
        const { data } =
          await api.get("/wishlist");

        setWishlistItems(
          Array.isArray(data)
            ? data
            : data?.wishlist ||
              data?.items ||
              []
        );
      } catch (error) {
        console.error(
          "Error fetching wishlist:",
          error
        );

        setWishlistItems([]);
      }
    };

    fetchWishlist();
  }, [customer]);


  // ============================================
  // FETCH CATEGORIES
  // ============================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } =
          await api.get("/categories");

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching categories:",
          error
        );

        setCategories([]);
      }
    };

    fetchCategories();
  }, []);


  // ============================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  // ============================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(
          ".header-category"
        )
      ) {
        setCategoryOpen(false);
      }

      if (
        !event.target.closest(
          ".profile-dropdown"
        )
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  // ============================================
  // CART COUNT
  // ============================================

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );


  // ============================================
  // CART TOTAL
  // ============================================

  const cartTotal = cartItems.reduce(
    (total, item) => {
      const product =
        item?.product || item;

      const price = Number(
        item?.price ??
          product?.price ??
          product?.selling_price ??
          product?.sale_price ??
          0
      );

      const quantity = Number(
        item?.quantity || 1
      );

      return total + price * quantity;
    },
    0
  );


  // ============================================
  // IMAGE URL
  // ============================================

  const getImageUrl = (image) => {
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };


  // ============================================
  // CATEGORY DROPDOWN
  // ============================================

  const toggleCategory = () => {
    setCategoryOpen(
      (previous) => !previous
    );

    setAccountOpen(false);
  };


  // ============================================
  // ACCOUNT DROPDOWN
  // ============================================

  const toggleAccount = () => {
    setAccountOpen(
      (previous) => !previous
    );

    setCategoryOpen(false);
  };


  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(
      `/search?q=${encodeURIComponent(query)}`
    );

    setSearchQuery("");
  };


  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = async () => {
    try {
      setAccountOpen(false);

      await logout();

      navigate("/login");
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };


  // ============================================
  // PRODUCT OBJECT
  // ============================================

  const getProduct = (item) => {
    return item?.product || item || {};
  };


  // ============================================
  // PRODUCT ID
  // ============================================

  const getProductId = (item) => {
    const product = getProduct(item);

    return (
      product?.id ||
      item?.product_id ||
      item?.productId ||
      item?.id ||
      null
    );
  };


  // ============================================
  // PRODUCT IMAGE
  // ============================================

  const getProductImage = (item) => {
    const product = getProduct(item);

    return (
      product?.images?.[0] ||
      product?.productImages?.[0] ||
      product?.image ||
      product?.productImage ||
      item?.productImages?.[0] ||
      item?.images?.[0] ||
      item?.image ||
      null
    );
  };


  // ============================================
  // PRODUCT NAME
  // ============================================

  const getProductName = (item) => {
    const product = getProduct(item);

    return (
      product?.name ||
      product?.product_name ||
      product?.productName ||
      item?.name ||
      item?.productName ||
      "Product"
    );
  };


  // ============================================
  // PRODUCT PRICE
  // ============================================

  const getProductPrice = (item) => {
    const product = getProduct(item);

    return Number(
      item?.price ??
        product?.price ??
        product?.selling_price ??
        product?.sale_price ??
        0
    );
  };


  // ============================================
  // PRODUCT CATEGORY
  // ============================================

  const getProductCategory = (item) => {
    const product = getProduct(item);

    if (
      typeof product?.category === "object"
    ) {
      return (
        product.category?.name ||
        product.category?.category_name ||
        ""
      );
    }

    return (
      product?.category ||
      product?.category_name ||
      item?.category ||
      item?.category_name ||
      ""
    );
  };


  // ============================================
  // PRODUCT DESCRIPTION
  // ============================================

  const getProductDescription = (item) => {
    const product = getProduct(item);

    return (
      product?.short_description ||
      product?.shortDescription ||
      product?.description ||
      item?.short_description ||
      item?.description ||
      ""
    );
  };


  // ============================================
  // PRODUCT STOCK
  // ============================================

  const getProductStock = (item) => {
    const product = getProduct(item);

    if (
      product?.stock !== undefined &&
      product?.stock !== null
    ) {
      return product.stock;
    }

    if (
      product?.stock_quantity !== undefined &&
      product?.stock_quantity !== null
    ) {
      return product.stock_quantity;
    }

    if (
      item?.stock !== undefined &&
      item?.stock !== null
    ) {
      return item.stock;
    }

    return null;
  };


  // ============================================
  // PRODUCT BRAND
  // ============================================

  const getProductBrand = (item) => {
    const product = getProduct(item);

    if (
      typeof product?.brand === "object"
    ) {
      return (
        product.brand?.name ||
        product.brand?.brand_name ||
        ""
      );
    }

    return (
      product?.brand ||
      product?.brand_name ||
      item?.brand ||
      item?.brand_name ||
      ""
    );
  };


  // ============================================
  // PRODUCT RATING
  // ============================================

  const getProductRating = (item) => {
    const product = getProduct(item);

    return (
      product?.rating ??
      product?.average_rating ??
      item?.rating ??
      item?.average_rating ??
      null
    );
  };


  // ============================================
  // PRODUCT STATUS
  // ============================================

  const getProductStatus = (item) => {
    const product = getProduct(item);

    if (
      product?.status !== undefined
    ) {
      return product.status;
    }

    if (
      product?.is_active !== undefined
    ) {
      return Number(product.is_active) === 1
        ? "Active"
        : "Inactive";
    }

    return "";
  };


  // ============================================
  // PRODUCT URL
  // ============================================

  const getProductUrl = (item) => {
    const id = getProductId(item);

    if (!id) {
      return "/";
    }

    return `/product/${id}`;
  };


  // ============================================
  // PRODUCT DETAIL HOVER
  // ============================================

  const ProductDetailHover = ({
    item,
    isCart = false,
  }) => {
    const product = getProduct(item);

    const image = getProductImage(item);
    const imageUrl = getImageUrl(image);

    const name = getProductName(item);
    const price = getProductPrice(item);

    const category =
      getProductCategory(item);

    const brand =
      getProductBrand(item);

    const description =
      getProductDescription(item);

    const stock =
      getProductStock(item);

    const rating =
      getProductRating(item);

    const status =
      getProductStatus(item);

    const quantity = Number(
      item?.quantity || 1
    );

    return (
      <div
        className="header-product-detail-hover"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* IMAGE */}
        <div className="header-detail-image">

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
            />
          ) : (
            <div className="header-detail-placeholder">
              <i className="fa-regular fa-image"></i>
            </div>
          )}

        </div>


        {/* DETAILS */}
        <div className="header-detail-content">

          <h4>
            {name}
          </h4>


          {/* PRICE */}
          <div className="header-detail-price">
            ₹
            {price.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </div>


          {/* BRAND */}
          {brand && (
            <div className="header-detail-row">

              <span>
                Brand
              </span>

              <strong>
                {brand}
              </strong>

            </div>
          )}


          {/* CATEGORY */}
          {category && (
            <div className="header-detail-row">

              <span>
                Category
              </span>

              <strong>
                {category}
              </strong>

            </div>
          )}


          {/* CART QUANTITY */}
          {isCart && (
            <div className="header-detail-row">

              <span>
                Quantity
              </span>

              <strong>
                {quantity}
              </strong>

            </div>
          )}


          {/* STOCK */}
          {stock !== null && (
            <div className="header-detail-row">

              <span>
                Stock
              </span>

              <strong
                className={
                  Number(stock) > 0
                    ? "stock-available"
                    : "stock-unavailable"
                }
              >
                {Number(stock) > 0
                  ? `${stock} available`
                  : "Out of stock"}
              </strong>

            </div>
          )}


          {/* STATUS */}
          {status && (
            <div className="header-detail-row">

              <span>
                Status
              </span>

              <strong>
                {status}
              </strong>

            </div>
          )}


          {/* RATING */}
          {rating !== null &&
            rating !== undefined && (
              <div className="header-detail-rating">

                <i className="fa-solid fa-star"></i>

                <span>
                  {Number(rating).toFixed(1)}
                </span>

              </div>
            )}


          {/* DESCRIPTION */}
          {description && (
            <p className="header-detail-description">
              {description}
            </p>
          )}


          {/* VIEW PRODUCT */}
          <Link
            to={getProductUrl(item)}
            className="header-detail-button"
          >
            View Product
          </Link>

        </div>

      </div>
    );
  };


  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <Loader
        label={t("loading")}
        inline
      />
    );
  }


  // ============================================
  // RENDER
  // ============================================

  return (
    <header className="site-header">

      <Topbar />


      <div className="header-main">

        {/* ======================================
            LOGO
        ====================================== */}

        <div className="header-logo">

          <Link to="/">
            <img
              src={logonav}
              alt="KVK Logo"
            />
          </Link>

        </div>


        {/* ======================================
            SEARCH + CATEGORY
        ====================================== */}

        <div className="header-search-wrapper">

          {/* CATEGORY */}

          <div
            className={`header-category ${
              categoryOpen
                ? "open"
                : ""
            }`}
          >

            <button
              type="button"
              className="openselect"
              onClick={toggleCategory}
              aria-expanded={categoryOpen}
            >

              <span>
                All Categories
              </span>

              <i className="fa-solid fa-chevron-down"></i>

            </button>


            <div className="selectDrop">

              <ul className="searchResults">

                {categories.length > 0 ? (
                  categories.map(
                    (category) => (
                      <li
                        key={category.id}
                      >
                        <Link
                          to={`/products-categories/${encodeURIComponent(
                            category.name
                          )}`}
                          onClick={() =>
                            setCategoryOpen(false)
                          }
                        >
                          {category.name}
                        </Link>
                      </li>
                    )
                  )
                ) : (
                  <li>
                    No Categories Found
                  </li>
                )}

              </ul>

            </div>

          </div>


          {/* SEARCH */}

          <form
            className="header-search"
            onSubmit={handleSearch}
          >

            <input
              type="search"
              placeholder={t("searchProducts")}
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />

            <button
              type="submit"
              aria-label="Search products"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>

          </form>

        </div>


        {/* ======================================
            RIGHT ACTIONS
        ====================================== */}

        <div className="header-actions">


          {/* ==================================
              TRACK
          ================================== */}

          <Link
            to="/trackmyorder"
            className="action-item"
          >

            <i className="fa-solid fa-truck"></i>

            <span>
              Track
            </span>

          </Link>


          {/* ==================================
              WISHLIST
          ================================== */}

          <div className="header-hover-action">

            <Link
              to="/wishlist"
              className="action-item"
            >

              <i className="fa-solid fa-heart"></i>

              {wishlistItems.length > 0 && (
                <span className="header-action-badge">
                  {wishlistItems.length}
                </span>
              )}

              <span>
                Wishlist
              </span>

            </Link>


            <div className="header-product-dropdown">

              <div className="header-dropdown-title">

                <span>
                  Wishlist
                </span>

                <span className="header-dropdown-count">
                  {wishlistItems.length}
                </span>

              </div>


              {wishlistItems.length > 0 ? (
                <>

                  <div className="header-product-list">

                    {wishlistItems
                      .slice(0, 5)
                      .map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            className="header-product-item"
                            key={
                              item.id ||
                              item.product_id ||
                              index
                            }
                          >

                            {/* SMALL IMAGE */}

                            <Link
                              to={getProductUrl(item)}
                              className="header-product-image-link"
                            >

                              {getImageUrl(
                                getProductImage(item)
                              ) ? (
                                <img
                                  src={getImageUrl(
                                    getProductImage(item)
                                  )}
                                  alt={getProductName(
                                    item
                                  )}
                                  className="header-product-image"
                                />
                              ) : (
                                <div className="header-product-placeholder">
                                  <i className="fa-regular fa-image"></i>
                                </div>
                              )}

                            </Link>


                            {/* BASIC INFO */}

                            <div className="header-product-info">

                              <Link
                                to={getProductUrl(item)}
                                className="header-product-name"
                              >
                                {getProductName(
                                  item
                                )}
                              </Link>

                              <div className="header-product-price">
                                ₹
                                {getProductPrice(
                                  item
                                ).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </div>

                            </div>


                            {/* COMPLETE DETAILS ON HOVER */}

                            <ProductDetailHover
                              item={item}
                            />

                          </div>

                        )
                      )}

                  </div>


                  {wishlistItems.length > 5 && (
                    <div className="header-more-items">
                      +
                      {wishlistItems.length - 5}{" "}
                      more items
                    </div>
                  )}


                  <Link
                    to="/wishlist"
                    className="header-dropdown-footer"
                  >
                    View Wishlist →
                  </Link>

                </>

              ) : (

                <div className="header-dropdown-empty">

                  <i className="fa-regular fa-heart"></i>

                  <p>
                    Your wishlist is empty
                  </p>

                  <Link to="/">
                    Browse Products
                  </Link>

                </div>

              )}

            </div>

          </div>


          {/* ==================================
              CART
          ================================== */}

          <div className="header-hover-action">

            <Link
              to="/cartpage"
              className="action-item cart-item"
            >

              <i className="fa-solid fa-cart-shopping"></i>

              {cartCount > 0 && (
                <span className="header-action-badge">
                  {cartCount}
                </span>
              )}

              <span>
                Cart
              </span>

            </Link>


            <div className="header-product-dropdown">

              <div className="header-dropdown-title">

                <span>
                  Shopping Cart
                </span>

                <span className="header-dropdown-count">
                  {cartCount}
                </span>

              </div>


              {cartItems.length > 0 ? (
                <>

                  <div className="header-product-list">

                    {cartItems
                      .slice(0, 5)
                      .map(
                        (
                          item,
                          index
                        ) => {

                          const price =
                            getProductPrice(item);

                          const quantity =
                            Number(
                              item.quantity || 1
                            );

                          const itemTotal =
                            price * quantity;

                          return (
                            <div
                              className="header-product-item"
                              key={
                                item.id ||
                                item.product_id ||
                                index
                              }
                            >

                              {/* SMALL IMAGE */}

                              <Link
                                to={getProductUrl(item)}
                                className="header-product-image-link"
                              >

                                {getImageUrl(
                                  getProductImage(item)
                                ) ? (
                                  <img
                                    src={getImageUrl(
                                      getProductImage(item)
                                    )}
                                    alt={getProductName(
                                      item
                                    )}
                                    className="header-product-image"
                                  />
                                ) : (
                                  <div className="header-product-placeholder">
                                    <i className="fa-regular fa-image"></i>
                                  </div>
                                )}

                              </Link>


                              {/* BASIC INFO */}

                              <div className="header-product-info">

                                <Link
                                  to={getProductUrl(item)}
                                  className="header-product-name"
                                >
                                  {getProductName(
                                    item
                                  )}
                                </Link>

                                <div className="header-cart-item-meta">
                                  Qty: {quantity}
                                </div>

                                <div className="header-product-price">
                                  ₹
                                  {itemTotal.toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </div>

                              </div>


                              {/* COMPLETE DETAILS ON HOVER */}

                              <ProductDetailHover
                                item={item}
                                isCart
                              />

                            </div>
                          );
                        }
                      )}

                  </div>


                  {cartItems.length > 5 && (
                    <div className="header-more-items">
                      +
                      {cartItems.length - 5}{" "}
                      more items
                    </div>
                  )}


                  {/* CART TOTAL */}

                  <div className="header-cart-total">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {cartTotal.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </strong>

                  </div>


                  {/* VIEW CART */}

                  <Link
                    to="/cartpage"
                    className="header-dropdown-footer"
                  >
                    View Cart →
                  </Link>

                </>

              ) : (

                <div className="header-dropdown-empty">

                  <i className="fa-solid fa-cart-shopping"></i>

                  <p>
                    Your cart is empty
                  </p>

                  <Link to="/">
                    Continue Shopping
                  </Link>

                </div>

              )}

            </div>

          </div>


          {/* ==================================
              ACCOUNT
          ================================== */}

          {customer ? (

            <div
              className={`profile-dropdown ${
                accountOpen
                  ? "open"
                  : ""
              }`}
            >

              <button
                type="button"
                className="action-item account-toggle"
                onClick={toggleAccount}
                aria-expanded={accountOpen}
              >

                <i className="fa-solid fa-user"></i>

                <span>
                  Account
                </span>

              </button>


              <ul className="dropdown-menu">

                {/* MY ACCOUNT */}

                <li>
                  <Link
                    to="/account/profile"
                    onClick={() =>
                      setAccountOpen(false)
                    }
                  >
                    <i className="fa-regular fa-user"> </i> 
                     {t("myAccount")}
                  </Link>
                </li>


                {/* MY ORDERS */}

                <li>
                  <Link
                    to="/orders"
                    onClick={() =>
                      setAccountOpen(false)
                    }
                  >
                    <i className="fa-solid fa-box"></i>
                    {t("myOrders")}
                  </Link>
                </li>


                {/* CHANGE PASSWORD */}

                <li>
                  <Link
                    to="/account/password"
                    onClick={() =>
                      setAccountOpen(false)
                    }
                  >
                    <i className="fa-solid fa-lock"></i>
                    Change Password
                  </Link>
                </li>


                {/* MY ADDRESSES */}

                <li>
                  <Link
                    to="/account/addresses"
                    onClick={() =>
                      setAccountOpen(false)
                    }
                  >
                    <i className="fa-solid fa-location-dot"></i>
                    {t("myAddresses")}
                  </Link>
                </li>


                {/* LOGOUT */}

                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    {t("logout")}
                  </button>
                </li>

              </ul>

            </div>

          ) : (

            <Link
              to="/login"
              className="action-item"
            >
              <i className="fa-solid fa-user"></i>

              <span>
                Sign In
              </span>
            </Link>

          )}

        </div>

      </div>


      {/* NAVBAR */}

      <Navbar />

    </header>
  );
};

export default Header;
