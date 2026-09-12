import { useEffect, useMemo, useState } from "react";
import api from "../../api.js";
import { Link } from "react-router-dom";
import { DailyDealsCard } from "./DailyDealsCard";
import "./DailyDeals.css";
import { Reveal } from "../../Reveal";

const SkeletonGrid = ({ count = 6 }) => (
  <div className="dd-skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div className="dd-skeleton-card" key={i}>
        <div className="dd-skeleton-img" />
        <div className="dd-skeleton-line" />
        <div className="dd-skeleton-line short" />
      </div>
    ))}
  </div>
);

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const DailyDealsProducts = () => {
  const [ddproducts, setDdProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [toast, setToast] = useState(null);

  // =========================================
  // TOAST
  // =========================================
  const showToast = (msg) => {
    setToast(msg);

    window.clearTimeout(showToast._t);

    showToast._t = window.setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // =========================================
  // FETCH DAILY DEALS + CATEGORIES
  // =========================================
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [dealsRes, catsRes] = await Promise.all([
          api.get("/products/deals/daily"),
          api.get("/categories"),
        ]);

        if (!isMounted) return;

        const deals = Array.isArray(dealsRes.data)
          ? dealsRes.data
          : [];

        const cats = Array.isArray(catsRes.data)
          ? catsRes.data
          : [];

        setDdProducts(deals);
        setCategories(cats);

        if (cats.length) {
          setActiveCategory((prev) => {
            return prev || String(cats[0].id);
          });
        }
      } catch (err) {
        console.error(
          "Error fetching daily deals:",
          err.response?.data || err.message
        );

        if (isMounted) {
          setError(
            "We couldn't load today's deals. Please try again shortly."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================================
  // FILTER + SEARCH + SORT
  // =========================================
  const filteredProducts = useMemo(() => {
    return [...ddproducts]
      .filter((p) =>
        activeCategory === ""
          ? true
          : String(p.category_id) ===
            String(activeCategory)
      )
      .filter((p) => {
        const q = search.trim().toLowerCase();

        if (!q) return true;

        return (
          p.title?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const priceA =
          Number(
            a.daily_deal_price ?? a.price ?? 0
          );

        const priceB =
          Number(
            b.daily_deal_price ?? b.price ?? 0
          );

        if (priceSort === "low") {
          return priceA - priceB;
        }

        if (priceSort === "high") {
          return priceB - priceA;
        }

        return 0;
      });
  }, [
    ddproducts,
    activeCategory,
    search,
    priceSort,
  ]);

  return (
    <div className="daily-deals">
      <div className="dailydeals-container">

        {/* =====================================
            SECTION TITLE
        ===================================== */}
        <Reveal className="dd-section-title">
          <div>
            <span className="dd-eyebrow">
              Today only
            </span>

            <h2>Daily deals</h2>

            <p>
              Fresh discounts, refreshed every day.
            </p>
          </div>

          <Link to="/daily-deals-category">
            <button
              type="button"
              className="view-all-btn"
            >
              View all
            </button>
          </Link>
        </Reveal>

        {/* =====================================
            TOOLBAR
        ===================================== */}
        <div className="dd-toolbar">

          {/* CATEGORY FILTER */}
          <div
            className="dailydealstab-header"
            role="tablist"
            aria-label="Filter by category"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={
                  activeCategory ===
                  String(cat.id)
                }
                className={
                  activeCategory ===
                  String(cat.id)
                    ? "dailydealstab-active"
                    : "dailydealstab"
                }
                onClick={() =>
                  setActiveCategory(
                    String(cat.id)
                  )
                }
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* SEARCH + SORT */}
          <div className="dd-search-sort">

            <div className="dd-search">
              <SearchIcon />

              <input
                type="text"
                placeholder="Search deals..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                aria-label="Search daily deals"
              />
            </div>

            <div className="dd-sort">
              <select
                value={priceSort}
                onChange={(e) =>
                  setPriceSort(e.target.value)
                }
                aria-label="Sort by price"
              >
                <option value="">
                  Sort: Featured
                </option>

                <option value="low">
                  Price: Low to high
                </option>

                <option value="high">
                  Price: High to low
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* =====================================
            CONTENT
        ===================================== */}
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="dd-empty-state">
            <strong>
              Something went wrong
            </strong>

            {error}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="dailydeals-grid">
            {filteredProducts.map(
              (ddproduct) => (
                <DailyDealsCard
                  key={ddproduct.id}
                  ddproduct={ddproduct}
                  onToast={showToast}
                />
              )
            )}
          </div>
        ) : (
          <div className="dd-empty-state">
            <strong>
              No deals match your filters
            </strong>

            Try a different category or clear
            your search.
          </div>
        )}
      </div>

      {/* =======================================
          TOAST
      ======================================= */}
      {toast && (
        <div
          className="dd-toast"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
};