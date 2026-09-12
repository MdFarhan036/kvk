import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import api from "../../api.js";

import { FeaturedCategories } from "./FeaturedCategories";
import "./HomeProducts.css";
import { Reveal } from "../../Reveal";

export const HomeProducts = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const tabsRef = useRef(null);

  // =========================================================
  // FETCH POPULAR PRODUCTS
  // =========================================================

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        setError(false);

        const { data } = await api.get(
          "/products/popular/by-category"
        );

        setPopularCategories(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Error fetching popular products:",
          err
        );

        setError(true);
        setPopularCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  // =========================================================
  // KEEP ACTIVE TAB VISIBLE ON MOBILE
  // =========================================================

  useEffect(() => {
    if (!tabsRef.current) return;

    const activeBtn =
      tabsRef.current.querySelector(
        ".tab-btn--active"
      );

    activeBtn?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="hp-section">
        <div className="hp-container">

          <div className="hp-skeleton-header" />

          <div className="hp-skeleton-tabs">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="hp-skeleton-tab"
              />
            ))}
          </div>

          <div className="hp-skeleton-grid">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="hp-skeleton-card"
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <div className="hp-section">
        <div className="hp-container hp-error-state">

          <span className="hp-error-icon">
            ⚠
          </span>

          <p>
            Couldn&apos;t load products. Check your
            connection and try again.
          </p>

          <button
            className="hp-retry-btn"
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // EMPTY STATE
  // =========================================================

  if (!popularCategories.length) {
    return (
      <div className="hp-section">
        <div className="hp-container hp-empty-state">

          <p>
            No popular products at the moment.
            Check back soon.
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <section className="hp-section">

      <div className="hp-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <Reveal className="hp-header">

          <div className="hp-header-left">

            <span className="hp-eyebrow">
              Trending now
            </span>

            <h2 className="hp-title">
              Popular Products
            </h2>

          </div>

          <Link
            to="/featured-category"
            className="hp-view-all"
          >
            View All

            <svg
              className="hp-view-all-icon"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </Link>

        </Reveal>

        {/* =================================================
            CATEGORY TABS
        ================================================= */}

        <div
          className="hp-tabs"
          ref={tabsRef}
          role="tablist"
          aria-label="Product categories"
        >

          {popularCategories.map(
            (category, index) => (
              <button
                key={
                  category.id ??
                  category.name ??
                  index
                }
                type="button"
                role="tab"
                aria-selected={
                  activeTab === index
                }
                aria-controls={`hp-panel-${index}`}
                id={`hp-tab-${index}`}
                className={`tab-btn ${
                  activeTab === index
                    ? "tab-btn--active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(index)
                }
              >

                {category.name}

                {activeTab === index && (
                  <span className="tab-btn__indicator" />
                )}

              </button>
            )
          )}

        </div>

        {/* =================================================
            PRODUCTS PANEL
        ================================================= */}

        <div
          className="hp-panel"
          role="tabpanel"
          id={`hp-panel-${activeTab}`}
          aria-labelledby={`hp-tab-${activeTab}`}
          key={activeTab}
        >

          {popularCategories[activeTab] && (
            <FeaturedCategories
              featuredcategory={
                popularCategories[activeTab]
              }
            />
          )}

        </div>

      </div>

    </section>
  );
};