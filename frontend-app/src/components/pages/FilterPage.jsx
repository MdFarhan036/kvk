import { Link } from "react-router-dom";
import { useFilters } from "../../FilterContext";
import { ASSET_BASE_URL } from "../api.js";

export const FilterPage = ({
  categories = [],
  products = [],
  brands = [],
  stockSummary = {
    inStock: 0,
    outStock: 0,
  },
  isFilterVisible,
  setIsFilterVisible,
}) => {
  const {
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedBrands,
    setSelectedBrands,
    selectedStock,
    setSelectedStock,
    clearFilters,
  } = useFilters();

  // =================================
  // IMAGE URL HELPER
  // =================================

  const getImageUrl = (image) => {
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  return (
    <div className="listing-wrapper">

      {/* =================================
          CATEGORIES
      ================================= */}

      <div className="sidebar-category-card">

        <h3>Categories</h3>

        <div className="listing-catList">

          {categories.map((cat) => {

            const categoryImage =
              getImageUrl(cat.image);

            const categoryProductCount =
              products.filter((product) => {
                const productCategory =
                  product.category_name ||
                  product.category?.name ||
                  "";

                return (
                  productCategory
                    .toLowerCase()
                    .trim() ===
                  String(cat.name)
                    .toLowerCase()
                    .trim()
                );
              }).length;

            return (
              <div
                key={cat.id}
                className="listing-catItem"
              >

                <span className="catList-img">

                  {categoryImage ? (
                    <img
                      src={categoryImage}
                      alt={cat.name}
                      width={30}
                    />
                  ) : (
                    <span className="category-image-placeholder">
                      📦
                    </span>
                  )}

                </span>

                <Link
                  to={`/products-categories/${encodeURIComponent(
                    cat.name
                  )}`}
                >
                  <h4>{cat.name}</h4>
                </Link>

                <span className="catList-stock">
                  {categoryProductCount}
                </span>

              </div>
            );
          })}

        </div>
      </div>

      {/* =================================
          PRICE FILTER
      ================================= */}

      <div className="sidebar-category-card">

        <h3>Filter By Price</h3>

        <div className="price-filter">

          <label>
            Min Price: ₹{minPrice}
          </label>

          <input
            type="range"
            min="0"
            max="100000"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(
                Number(e.target.value)
              )
            }
          />

          <label>
            Max Price: ₹{maxPrice}
          </label>

          <input
            type="range"
            min="0"
            max="100000"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(
                Number(e.target.value)
              )
            }
          />

        </div>
      </div>

      {/* =================================
          BRAND FILTER
      ================================= */}

      <div className="sidebar-category-card">

        <h3>Filter By Brand</h3>

        <div className="brand-filter">

          {brands.map((brand) => (

            <div key={brand}>

              <label>

                <input
                  type="checkbox"
                  value={brand}
                  checked={selectedBrands.includes(
                    brand
                  )}
                  onChange={(e) => {

                    if (e.target.checked) {

                      setSelectedBrands([
                        ...selectedBrands,
                        brand,
                      ]);

                    } else {

                      setSelectedBrands(
                        selectedBrands.filter(
                          (selectedBrand) =>
                            selectedBrand !== brand
                        )
                      );

                    }
                  }}
                />

                {brand}

              </label>

            </div>

          ))}

        </div>
      </div>

      {/* =================================
          STOCK FILTER
      ================================= */}

      <div className="sidebar-category-card">

        <h3>Filter By Stock</h3>

        <div className="stock-filter">

          <label>

            <input
              type="radio"
              name="stock"
              value="in"
              checked={
                selectedStock === "in"
              }
              onChange={() =>
                setSelectedStock("in")
              }
            />

            In Stock (
            {stockSummary.inStock || 0}
            )

          </label>

          <label>

            <input
              type="radio"
              name="stock"
              value="out"
              checked={
                selectedStock === "out"
              }
              onChange={() =>
                setSelectedStock("out")
              }
            />

            Out of Stock (
            {stockSummary.outStock || 0}
            )

          </label>

          <label>

            <input
              type="radio"
              name="stock"
              value=""
              checked={
                selectedStock === ""
              }
              onChange={() =>
                setSelectedStock("")
              }
            />

            All

          </label>

        </div>
      </div>

      {/* =================================
          FILTER BUTTONS
      ================================= */}

      <div className="sidebar-category-card">

        <button
          type="button"
          onClick={() =>
            setIsFilterVisible(
              !isFilterVisible
            )
          }
        >
          {isFilterVisible
            ? "Hide Filters"
            : "Show Filters"}
        </button>

        {isFilterVisible && (

          <button
            type="button"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>

        )}

      </div>

    </div>
  );
};