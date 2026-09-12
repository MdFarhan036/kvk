import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import wishlistimg from "../../../assets/img/wishlist.png";
import previewimg from "../../../assets/img/eyeicon.jpg";
import { ASSET_BASE_URL } from "../../api.js";
import "./RelatedProducts.css";

const RelatedProducts = ({
  related = [],
  categoryName,
  addToWishlist,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortOption, setSortOption] = useState("Featured");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isOpenDropdown2, setIsOpenDropdown2] = useState(false);

  // =========================================
  // IMAGE URL
  // =========================================

  const getImageUrl = (url) => {
    if (!url) return "";

    if (typeof url !== "string") return "";

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${ASSET_BASE_URL}${
      url.startsWith("/") ? "" : "/"
    }${url}`;
  };

  // =========================================
  // PAGINATION
  // =========================================

  const totalPages = Math.ceil(
    related.length / itemsPerPage
  );

  const indexOfLast =
    currentPage * itemsPerPage;

  const indexOfFirst =
    indexOfLast - itemsPerPage;

  let displayedRelated = [...related].slice(
    indexOfFirst,
    indexOfLast
  );

  // =========================================
  // SORTING
  // =========================================

  if (sortOption === "PriceLowToHigh") {
    displayedRelated.sort(
      (a, b) =>
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
  } else if (sortOption === "PriceHighToLow") {
    displayedRelated.sort(
      (a, b) =>
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
  } else if (sortOption === "AvgRating") {
    displayedRelated.sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    );
  }

  // =========================================
  // PAGE CHANGE
  // =========================================

  const handlePageChange = (page) => {
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

  // =========================================
  // RESET PAGE
  // =========================================

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, sortOption, related]);

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="related-products">

      <h2>Related Products</h2>

      {/* =========================================
          TOP BAR
      ========================================= */}

      <div className="top-strip">
        <div className="strip-bar-tab">

          {/* SHOW */}
          <div className="strip-bar-tab-btn1">

            <button
              type="button"
              onClick={() =>
                setIsOpenDropdown(
                  !isOpenDropdown
                )
              }
            >
              Show: {itemsPerPage}
            </button>

            {isOpenDropdown && (
              <ul className="dropdownMenu">

                {[50, 100, 150, 200, related.length]
                  .filter(
                    (num, index, array) =>
                      num > 0 &&
                      array.indexOf(num) === index
                  )
                  .map((num) => (
                    <li key={num}>
                      <button
                        type="button"
                        onClick={() => {
                          setItemsPerPage(num);
                          setIsOpenDropdown(false);
                        }}
                      >
                        {num}
                      </button>
                    </li>
                  ))}

              </ul>
            )}

          </div>

          {/* SORT */}
          <div className="strip-bar-tab-btn2">

            <button
              type="button"
              onClick={() =>
                setIsOpenDropdown2(
                  !isOpenDropdown2
                )
              }
            >
              Sort by: {sortOption}
            </button>

            {isOpenDropdown2 && (
              <ul className="dropdownMenu">

                {[
                  {
                    label: "Featured",
                    value: "Featured",
                  },
                  {
                    label: "Price: Low to High",
                    value: "PriceLowToHigh",
                  },
                  {
                    label: "Price: High to Low",
                    value: "PriceHighToLow",
                  },
                  {
                    label: "Avg. Rating",
                    value: "AvgRating",
                  },
                ].map((option) => (
                  <li key={option.value}>

                    <button
                      type="button"
                      onClick={() => {
                        setSortOption(
                          option.value
                        );
                        setIsOpenDropdown2(false);
                      }}
                    >
                      {option.label}
                    </button>

                  </li>
                ))}

              </ul>
            )}

          </div>

        </div>
      </div>

      {/* =========================================
          PRODUCTS
      ========================================= */}

      <div className="product-row">

        {displayedRelated.length > 0 ? (
          displayedRelated.map((p) => {

            const productName =
              p.title ||
              p.name ||
              "Product";

            const productCategory =
              p.category_name ||
              p.category?.name ||
              categoryName ||
              "";

            const productBrand =
              typeof p.brand === "string"
                ? p.brand
                : p.brand?.name ||
                  p.brand?.brand_name ||
                  p.brand_name ||
                  "";

            const productImage = p.images?.[0]
              ? getImageUrl(p.images[0])
              : "";

            const originalPrice =
              p.oldPrice ??
              p.old_price ??
              p.original_price ??
              p.orgprice ??
              0;

            const sellingPrice =
              p.price ??
              p.discount_price ??
              p.disprice ??
              0;

            const stock = Number(
              p.stock || 0
            );

            const productLink =
              productCategory
                ? `/products-categories/${encodeURIComponent(
                    productCategory
                  )}/${p.id}`
                : `/product/${p.id}`;

            return (
              <div
                key={p.id}
                className="product-card"
              >

                {/* IMAGE */}

                <div className="product-imgcard">

                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      loading="lazy"
                    />
                  ) : (
                    <span>No Image</span>
                  )}

                  <div className="img_overlay">

                    <ul className="list-product-overlay">

                      {/* WISHLIST */}

                      <li
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (
                            typeof addToWishlist ===
                            "function"
                          ) {
                            addToWishlist(p);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <img
                          src={wishlistimg}
                          alt="Wishlist"
                        />
                      </li>

                      {/* PREVIEW */}

                      <Link to={productLink}>
                        <li>
                          <img
                            src={previewimg}
                            alt="Preview"
                          />
                        </li>
                      </Link>

                    </ul>

                  </div>
                </div>

                {/* CONTENT */}

                <div className="product-contentcard">

                  <span>
                    {productCategory}
                  </span>

                  <h2>
                    {productName}
                  </h2>

                  {productBrand && (
                    <h6>
                      {productBrand}
                    </h6>
                  )}

                  <h5>
                    Stock:{" "}
                    {stock > 0
                      ? `In Stock (${stock})`
                      : "Out of Stock"}
                  </h5>

                  {/* PRICE */}

                  <div className="price">

                    {Number(originalPrice) !==
                      Number(sellingPrice) && (
                      <span className="original-price">
                        ₹
                        {Number(
                          originalPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}

                    <span className="discount-price">
                      ₹
                      {Number(
                        sellingPrice
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <p>No related products available.</p>
        )}

      </div>

      {/* =========================================
          PAGINATION
      ========================================= */}

      {totalPages > 1 && (
        <div className="pagination">

          <button
            type="button"
            onClick={() =>
              handlePageChange(
                currentPage - 1
              )
            }
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => (
              <button
                key={i + 1}
                type="button"
                className={
                  currentPage === i + 1
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handlePageChange(i + 1)
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
              currentPage === totalPages
            }
          >
            Next
          </button>

        </div>
      )}

    </div>
  );
};

export default RelatedProducts;