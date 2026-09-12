import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import wishlistimg from "../../../assets/img/wishlist.png";
import previewimg from "../../../assets/img/eyeicon.jpg";

import { ASSET_BASE_URL } from "../../api.js";

import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

export const HomeProduct = ({
  products = [],
  categoryName,
  itemsPerPage,
  setItemsPerPage,
  sortOption,
  setSortOption,
  isOpenDropdown,
  setIsOpenDropdown,
  isOpenDropdown2,
  setIsOpenDropdown2,
}) => {
  const [currentPage, setCurrentPage] =
    useState(1);

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
  // TOAST
  // =====================================================

  const showToast = (message) => {
    alert(message);
  };

  // =====================================================
  // SORT PRODUCTS
  // =====================================================

  const sortedProducts = [
    ...products,
  ].sort((a, b) => {
    if (
      sortOption ===
      "PriceLowToHigh"
    ) {
      return (
        Number(
          a.discount_price ??
            a.price ??
            0
        ) -
        Number(
          b.discount_price ??
            b.price ??
            0
        )
      );
    }

    if (
      sortOption ===
      "PriceHighToLow"
    ) {
      return (
        Number(
          b.discount_price ??
            b.price ??
            0
        ) -
        Number(
          a.discount_price ??
            a.price ??
            0
        )
      );
    }

    if (
      sortOption === "AvgRating"
    ) {
      return (
        Number(b.rating || 0) -
        Number(a.rating || 0)
      );
    }

    if (
      sortOption === "Release"
    ) {
      return (
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

    return 0;
  });

  // =====================================================
  // PAGINATION
  // =====================================================

  const safeItemsPerPage =
    Number(itemsPerPage) > 0
      ? Number(itemsPerPage)
      : 50;

  const totalPages = Math.ceil(
    sortedProducts.length /
      safeItemsPerPage
  );

  const indexOfLast =
    currentPage *
    safeItemsPerPage;

  const indexOfFirst =
    indexOfLast -
    safeItemsPerPage;

  const currentProducts =
    sortedProducts.slice(
      indexOfFirst,
      indexOfLast
    );

  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const handlePageChange = (
    page
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // RESET PAGE
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    products,
    itemsPerPage,
    sortOption,
  ]);

  // =====================================================
  // EMPTY
  // =====================================================

  if (!products.length) {
    return (
      <p className="no-products">
        No products found.
      </p>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="homeProduct">

      {/* =================================================
          TOP STRIP
      ================================================= */}

      <div className="top-strip">

        <p>
          We found{" "}
          <span className="text-success">
            {products.length}
          </span>{" "}
          items for you!
        </p>

        <div className="top-strip-bar">

          <div className="strip-bar-tab">

            {/* =================================================
                ITEMS PER PAGE
            ================================================= */}

            <div className="strip-bar-tab-btn1">

              <button
                type="button"
                className="tab-btn1"
                onClick={() =>
                  setIsOpenDropdown(
                    !isOpenDropdown
                  )
                }
              >
                Show:{" "}
                {itemsPerPage}
              </button>

              {isOpenDropdown && (
                <ul className="dropdownMenu">

                  {[
                    50,
                    100,
                    150,
                    200,
                    products.length,
                  ]
                    .filter(
                      (num, index, arr) =>
                        num > 0 &&
                        arr.indexOf(
                          num
                        ) === index
                    )
                    .map((num) => (
                      <li key={num}>

                        <button
                          type="button"
                          className="dropdownMenu-btn"
                          onClick={() => {
                            setItemsPerPage(
                              num
                            );

                            setCurrentPage(
                              1
                            );

                            setIsOpenDropdown(
                              false
                            );
                          }}
                        >
                          {num}
                        </button>

                      </li>
                    ))}

                </ul>
              )}

            </div>

            {/* =================================================
                SORTING
            ================================================= */}

            <div className="strip-bar-tab-btn2">

              <button
                type="button"
                className="tab-btn2"
                onClick={() =>
                  setIsOpenDropdown2(
                    !isOpenDropdown2
                  )
                }
              >
                Sort by:{" "}
                {sortOption}
              </button>

              {isOpenDropdown2 && (
                <ul className="dropdownMenu">

                  {[
                    {
                      label: "Featured",
                      value:
                        "Featured",
                    },
                    {
                      label:
                        "Price: Low to High",
                      value:
                        "PriceLowToHigh",
                    },
                    {
                      label:
                        "Price: High to Low",
                      value:
                        "PriceHighToLow",
                    },
                    {
                      label: "Release",
                      value:
                        "Release",
                    },
                    {
                      label:
                        "Avg. Rating",
                      value:
                        "AvgRating",
                    },
                  ].map(
                    (option) => (
                      <li
                        key={
                          option.value
                        }
                      >

                        <button
                          type="button"
                          className="dropdownMenu-btn"
                          onClick={() => {
                            setSortOption(
                              option.value
                            );

                            setCurrentPage(
                              1
                            );

                            setIsOpenDropdown2(
                              false
                            );
                          }}
                        >
                          {
                            option.label
                          }
                        </button>

                      </li>
                    )
                  )}

                </ul>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          PRODUCTS GRID
      ================================================= */}

      <div className="rightcontent">

        <div className="product-row">

          {currentProducts.map(
            (product) => {

              const productId =
                product.id;

              const productName =
                product.name ||
                product.title ||
                "Product";

              const category =
                product.category_name ||
                product.category?.name ||
                categoryName ||
                "";

              const image =
                product.images?.[0] ||
                product.image ||
                "";

              const imageUrl =
                getImageUrl(image);

              const price =
                product.discount_price ??
                product.price ??
                0;

              const originalPrice =
                product.oldPrice ??
                product.old_price ??
                product.orgprice ??
                product.price ??
                0;

              const stock =
                Number(
                  product.stock || 0
                );

              return (
                <div
                  key={productId}
                  className="product-card"
                >

                  {/* =================================================
                      PRODUCT IMAGE
                  ================================================= */}

                  <div className="product-imgcard">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={productName}
                      />
                    ) : (
                      <span>
                        No Image
                      </span>
                    )}

                    {/* =================================================
                        IMAGE OVERLAY
                    ================================================= */}

                    <div className="img_overlay">

                      <Link
                        to={`/products-categories/${encodeURIComponent(
                          category
                        )}/${productId}`}
                      >
                        <div className="preview-icon">

                          <img
                            src={previewimg}
                            alt="Preview"
                          />

                        </div>
                      </Link>

                    </div>

                    {/* =================================================
                        WISHLIST
                    ================================================= */}

                    <div
                      className="wishlist-icon"
                      onClick={() => {

                        addToWishlist({
                          ...product,
                          quantity: 1,
                          price,
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
                      PRODUCT CONTENT
                  ================================================= */}

                  <div className="product-contentcard">

                    <span>
                      {category}
                    </span>

                    <h2>
                      {productName}
                    </h2>

                    <h6>
                      {product.brand ||
                        "—"}
                    </h6>

                    {/* STOCK */}

                    <h5>
                      Stock:{" "}
                      {stock > 0
                        ? `In Stock (${stock})`
                        : "Out of Stock"}
                    </h5>

                    {/* =================================================
                        RATING
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
                        ₹{price}
                      </span>

                    </div>

                    {/* =================================================
                        ADD TO CART
                    ================================================= */}

                    <button
                      type="button"
                      className="addtocart"
                      disabled={
                        stock <= 0
                      }
                      onClick={() => {

                        if (stock <= 0) {
                          return;
                        }

                        addToCart({
                          ...product,
                          quantity: 1,
                          price,
                        });

                        showToast(
                          `${productName} added to cart!`
                        );

                      }}
                    >
                      <i className="fa-solid fa-cart-shopping" />{" "}
                      {stock > 0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {totalPages > 1 && (
        <div className="pagination">

          <button
            type="button"
            onClick={() =>
              handlePageChange(
                currentPage - 1
              )
            }
            disabled={
              currentPage === 1
            }
            className="page-btn"
          >
            Prev
          </button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, i) => (
              <button
                type="button"
                key={i + 1}
                className={`page-btn ${
                  currentPage ===
                  i + 1
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handlePageChange(
                    i + 1
                  )
                }
              >
                {i + 1}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() =>
              handlePageChange(
                currentPage + 1
              )
            }
            disabled={
              currentPage ===
              totalPages
            }
            className="page-btn"
          >
            Next
          </button>

        </div>
      )}

    </div>
  );
};