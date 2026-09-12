import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import api, { ASSET_BASE_URL } from "../../api.js";

import wishlistimg from "../../../assets/img/wishlist.png";
import previewimg from "../../../assets/img/eyeicon.jpg";

import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

import "./AllCategoriesProducts.css";

import { Loader } from "../../Loader";
import { Reveal } from "../../Reveal";

export const AllCategoriesProducts = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] =
    useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  /* =========================================================
     TOAST / MESSAGE
  ========================================================= */

  const showToast = (msg) => alert(msg);

  /* =========================================================
     IMAGE URL HELPER
  ========================================================= */

  const getImageUrl = (url) => {
    if (!url) {
      return null;
    }

    // Already a complete URL
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${ASSET_BASE_URL}${
      url.startsWith("/") ? "" : "/"
    }${url}`;
  };

  /* =========================================================
     FETCH CATEGORIES + PRODUCTS
  ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        /* =============================================
           FETCH ALL CATEGORIES
        ============================================= */

        const categoriesRes =
          await api.get("/categories");

        const allCategories = (
          Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : []
        ).map((category) => ({
          ...category,
          image: getImageUrl(category.image),
        }));

        setCategories(allCategories);

        /* =============================================
           FETCH ALL PRODUCTS
        ============================================= */

        const productsRes =
          await api.get("/products");

        const allProducts = (
          Array.isArray(productsRes.data)
            ? productsRes.data
            : []
        ).map((product) => ({
          ...product,
          pimage: product.pimage
            ? getImageUrl(product.pimage)
            : "/fallback-image.png",
        }));

        /* =============================================
           GROUP PRODUCTS BY CATEGORY ID
        ============================================= */

        const grouped = {};

        allProducts.forEach((product) => {
          if (!grouped[product.category_id]) {
            grouped[product.category_id] = [];
          }

          grouped[product.category_id].push(
            product
          );
        });

        setProductsByCategory(grouped);
      } catch (err) {
        console.error(
          "Error fetching categories/products:",
          err.response || err.message
        );

        setMessage(
          "Error fetching categories or products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <Loader
        label="Loading categories"
        fullpage
      />
    );
  }

  /* =========================================================
     NO CATEGORIES
  ========================================================= */

  if (!categories.length) {
    return (
      <p>
        {message ||
          "No categories available"}
      </p>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="acp-section">

      <div className="dailydeals-container">

        {categories.map((category) => (
          <div
            key={category.id}
            className="acp-category-block"
          >

            {/* =================================================
                CATEGORY HEADER
            ================================================= */}

            <Reveal
              className="acp-block-header"
              as="div"
            >
              <h2>
                {category.name}
              </h2>

              <Link
                to={`/products-categories/${encodeURIComponent(
                  category.name
                )}`}
              >
                <button className="view-all-btn">
                  View All
                </button>
              </Link>
            </Reveal>

            {/* =================================================
                CATEGORY PRODUCTS
            ================================================= */}

            <div className="dailydeals-content">

              {productsByCategory[
                category.id
              ] &&
              productsByCategory[
                category.id
              ].length > 0 ? (

                productsByCategory[
                  category.id
                ].map((product) => {

                  const imageUrl =
                    product.images &&
                    product.images.length > 0
                      ? getImageUrl(
                          product.images[0]
                        )
                      : null;

                  const productName =
                    product.name ||
                    product.title;

                  const productPrice =
                    Number(
                      product.discount_price ||
                        product.price ||
                        0
                    );

                  const originalPrice =
                    product.oldPrice ||
                    product.price;

                  return (
                    <div
                      key={product.id}
                      className="product-card"
                    >

                      {/* =================================================
                          PRODUCT IMAGE
                      ================================================= */}

                      <div className="product-imgcard">

                        {imageUrl ? (
                          <img
                            className="product-image"
                            src={imageUrl}
                            alt={
                              productName ||
                              "Product"
                            }
                          />
                        ) : (
                          <span>
                            No Image
                          </span>
                        )}

                        {/* =================================================
                            PREVIEW ICON
                        ================================================= */}

                        <div className="img_overlay">

                          <ul className="ddproduct-product-overlay">

                            <Link
                              to={`/products-categories/${encodeURIComponent(
                                category.name
                              )}/${product.id}`}
                            >
                              <li className="ddproduct-item-overlay">

                                <img
                                  src={previewimg}
                                  alt="Preview"
                                />

                              </li>
                            </Link>

                          </ul>

                        </div>

                        {/* =================================================
                            WISHLIST ICON
                        ================================================= */}

                        <div
                          className="wishlist-icon"
                          onClick={() => {
                            addToWishlist({
                              ...product,
                              quantity: 1,
                            });

                            showToast(
                              `${productName} added to wishlist!`
                            );
                          }}
                        >
                          <img
                            src={wishlistimg}
                            alt="Wishlist"
                          />
                        </div>

                      </div>

                      {/* =================================================
                          PRODUCT INFO
                      ================================================= */}

                      <div className="ddproduct-contentcard">

                        <span className="catName">
                          {product.category_name}
                        </span>

                        <h2 className="ddproducts-name">
                          {productName}
                        </h2>

                        <h4>
                          {product.brand}
                        </h4>

                        {/* STOCK */}

                        <h5>
                          Stock:{" "}
                          {Number(product.stock) > 0
                            ? `In Stock (${product.stock})`
                            : "Out of Stock"}
                        </h5>

                        {/* =================================================
                            RATINGS
                        ================================================= */}

                        <div className="product-ratings">

                          <span className="fa fa-star checked" />
                          <span className="fa fa-star checked" />
                          <span className="fa fa-star checked" />
                          <span className="fa fa-star" />
                          <span className="fa fa-star" />

                        </div>

                        {/* =================================================
                            PRICE
                        ================================================= */}

                        <div className="price">

                          <span className="original-price">
                            ₹{originalPrice}
                          </span>

                          <span className="discount-price">
                            ₹{productPrice}
                          </span>

                        </div>

                        {/* =================================================
                            ADD TO CART
                        ================================================= */}

                        <button
                          className="addtocart"
                          onClick={() => {
                            addToCart({
                              ...product,
                              quantity: 1,
                            });

                            showToast(
                              `${productName} added to cart!`
                            );
                          }}
                        >
                          <i className="fa-solid fa-cart-shopping" />
                          {" "}Add to Cart
                        </button>

                      </div>

                    </div>
                  );
                })

              ) : (

                <p>
                  No products available
                </p>

              )}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};