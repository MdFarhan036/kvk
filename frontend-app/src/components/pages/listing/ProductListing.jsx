import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";
import { HomeProduct } from "./HomeProduct";
import { Loader } from "../../Loader";

import "./Listing.css";
import { useWishlist } from "../../../context/WishlistContext";

import CategoriesPage from "../filters/CategoriesPage";
import PriceFilterPage from "../filters/PriceFilterPage";
import BrandFilterPage from "../filters/BrandFilterPage";
import StockFilterPage from "../filters/StockFilterPage";

import { useFilters } from "../../../context/FilterContext";
import RelatedProductCard from "./RelatedProductCard";

export const ProductListing = () => {
  const { categoryName } = useParams();
  const { addToWishlist } = useWishlist();

  const {
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedBrands,
    setSelectedBrands,
    selectedStock,
    setSelectedStock,
    sortOption,
    setSortOption,
    itemsPerPage,
    setItemsPerPage,
    clearFilters,
  } = useFilters();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  const [stockSummary, setStockSummary] = useState({
    inStock: 0,
    outStock: 0,
  });

  const [isFilterVisible, setIsFilterVisible] =
    useState(false);

  const [isRelatedVisible, setIsRelatedVisible] =
    useState(true);

  const [isOpenDropdown, setIsOpenDropdown] =
    useState(false);

  const [isOpenDropdown2, setIsOpenDropdown2] =
    useState(false);

  // =========================================
  // FETCH CATEGORIES
  // =========================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Categories fetch error:",
          error
        );

        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // =========================================
  // FETCH PRODUCTS
  // =========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Products fetch error:",
          error
        );

        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  // =========================================
  // FETCH BRANDS + STOCK
  // =========================================

  useEffect(() => {
    if (!categoryName) {
      setBrands([]);

      setStockSummary({
        inStock: 0,
        outStock: 0,
      });

      return;
    }

    const encodedCategoryName =
      encodeURIComponent(categoryName);

    // -----------------------------------------
    // BRANDS
    // -----------------------------------------

    api
      .get(
        `/brands/category/${encodedCategoryName}`
      )
      .then((res) => {
        let brandData = res.data;

        if (
          brandData &&
          !Array.isArray(brandData) &&
          Array.isArray(brandData.brands)
        ) {
          brandData = brandData.brands;
        }

        if (!Array.isArray(brandData)) {
          setBrands([]);
          return;
        }

        const formattedBrands = [
          ...new Set(
            brandData
              .map((item) => {
                if (typeof item === "string") {
                  return item.trim();
                }

                return (
                  item?.brand ||
                  item?.brand_name ||
                  item?.name ||
                  null
                );
              })
              .filter(Boolean)
          ),
        ];

        setBrands(formattedBrands);
      })
      .catch((error) => {
        console.error(
          "Brands fetch error:",
          error
        );

        setBrands([]);
      });

    // -----------------------------------------
    // STOCK
    // -----------------------------------------

    api
      .get(`/stock/${encodedCategoryName}`)
      .then((res) => {
        setStockSummary({
          inStock: Number(
            res.data?.inStock || 0
          ),
          outStock: Number(
            res.data?.outStock || 0
          ),
        });
      })
      .catch((error) => {
        console.error(
          "Stock fetch error:",
          error
        );

        setStockSummary({
          inStock: 0,
          outStock: 0,
        });
      });
  }, [categoryName]);

  // =========================================
  // FILTER + SORT PRODUCTS
  // =========================================

  useEffect(() => {
    let categoryProducts = products.filter(
      (product) => {
        const productCategory =
          product.category_name ||
          product.category?.name ||
          "";

        return (
          productCategory
            .toLowerCase()
            .trim() ===
          (categoryName || "")
            .toLowerCase()
            .trim()
        );
      }
    );

    // -----------------------------------------
    // PRICE FILTER
    // -----------------------------------------

    let updatedProducts =
      categoryProducts.filter(
        (product) => {
          const price = Number(
            product.price
          );

          return (
            price >= minPrice &&
            price <= maxPrice
          );
        }
      );

    // -----------------------------------------
    // BRAND FILTER
    // -----------------------------------------

    if (selectedBrands.length > 0) {
      updatedProducts =
        updatedProducts.filter(
          (product) => {
            let productBrand = null;

            if (
              typeof product.brand ===
              "string"
            ) {
              productBrand =
                product.brand;
            } else if (
              product.brand &&
              typeof product.brand ===
              "object"
            ) {
              productBrand =
                product.brand.name ||
                product.brand
                  .brand_name ||
                null;
            } else {
              productBrand =
                product.brand_name ||
                product.brandName ||
                null;
            }

            return selectedBrands.includes(
              productBrand
            );
          }
        );
    }

    // -----------------------------------------
    // STOCK FILTER
    // -----------------------------------------

    if (selectedStock === "in") {
      updatedProducts =
        updatedProducts.filter(
          (product) =>
            Number(product.stock) > 0
        );
    } else if (
      selectedStock === "out"
    ) {
      updatedProducts =
        updatedProducts.filter(
          (product) =>
            Number(product.stock) === 0
        );
    }

    // -----------------------------------------
    // SORTING
    // -----------------------------------------

    if (
      sortOption ===
      "PriceLowToHigh"
    ) {
      updatedProducts.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );
    }

    if (
      sortOption ===
      "PriceHighToLow"
    ) {
      updatedProducts.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
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

  // =========================================
  // RELATED PRODUCTS
  // =========================================

  const relatedProducts = products
    .filter((product) => {
      const productCategory =
        product.category_name ||
        product.category?.name ||
        "";

      return (
        productCategory
          .toLowerCase()
          .trim() ===
        (categoryName || "")
          .toLowerCase()
          .trim()
      );
    })
    .slice(0, 8);

  // =========================================
  // LOADER
  // =========================================

  if (
    !products.length ||
    !categories.length
  ) {
    return (
      <Loader
        label="Loading products"
        fullpage
      />
    );
  }

  // =========================================
  // DISPLAY CATEGORY NAME
  // =========================================

  const displayCategoryName =
    categoryName
      ? categoryName.charAt(0).toUpperCase() +
      categoryName.slice(1)
      : "Products";

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="listing-page">

      {/* =========================================
          BREADCRUMB
      ========================================= */}

      <div className="breadcrumb-wrapper">
        <div className="container-fluid">

          <ul className="breadcrumb-content">

            <li>
              <Link to="/">
                Home
              </Link>
            </li>

            <li>
              <Link
                to={`/products-categories/${encodeURIComponent(
                  categoryName || ""
                )}`}
              >
                {displayCategoryName}
              </Link>
            </li>

          </ul>

        </div>
      </div>

      <div className="listing-data">

        {/* =========================================
            SIDEBAR
        ========================================= */}

        <div className="listing-wrapper">

          {/* CATEGORIES */}

          <div className="listing-filters">

            <CategoriesPage
              categories={categories}
              products={products}
            />

            <PriceFilterPage
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
            />

            <BrandFilterPage
              brands={brands}
              selectedBrands={selectedBrands}
              setSelectedBrands={
                setSelectedBrands
              }
            />

            <StockFilterPage
              selectedStock={selectedStock}
              setSelectedStock={
                setSelectedStock
              }
              stockSummary={stockSummary}
            />

          </div>

          <div className="sidebar-category-card related-products-sidebar">

            <div
              className="related-products-sidebar-header"
              onClick={() =>
                setIsRelatedVisible(
                  (previous) =>
                    !previous
                )
              }
            >
              <h3>
                Related Products
              </h3>

              <span>
                {isRelatedVisible
                  ? "−"
                  : "+"}
              </span>
            </div>

            {isRelatedVisible && (
              <div className="related-products-sidebar-list">

                {relatedProducts.length >
                  0 ? (
                  relatedProducts.map(
                    (product) => (
                      <RelatedProductCard
                        key={
                          product.id
                        }
                        product={
                          product
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
            )}

          </div>

          {/* =================================================
              FILTER ACTIONS
          ================================================= */}

          <div className="sidebar-category-card">

            <button
              type="button"
              onClick={() =>
                setIsFilterVisible(
                  (previous) =>
                    !previous
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
                onClick={() => {
                  clearFilters();

                  setIsOpenDropdown(
                    false
                  );

                  setIsOpenDropdown2(
                    false
                  );
                }}
              >
                Clear All Filters
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            PRODUCTS + SORT + PAGINATION
            HomeProduct handles pagination.
        ================================================= */}

        <HomeProduct
          products={
            filteredProducts
          }

          categoryName={
            categoryName
          }

          itemsPerPage={
            itemsPerPage
          }

          setItemsPerPage={
            setItemsPerPage
          }

          sortOption={
            sortOption
          }

          setSortOption={
            setSortOption
          }

          isOpenDropdown={
            isOpenDropdown
          }

          setIsOpenDropdown={
            setIsOpenDropdown
          }

          isOpenDropdown2={
            isOpenDropdown2
          }

          setIsOpenDropdown2={
            setIsOpenDropdown2
          }
        />

      </div>
    </div>
  );
};