import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Affiliations.css";
import { Reveal } from "../Reveal";

import api, { ASSET_BASE_URL } from "../api.js";

export const Affiliations = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // =================================
  // FETCH BRANDS
  // =================================

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/brands/public");

        const formattedBrands = Array.isArray(data)
          ? data
              .map((brand) => ({
                ...brand,

                name:
                  brand.brand_name ||
                  brand.name ||
                  brand.brand ||
                  "",

                image: getImageUrl(brand.image),
              }))
              .filter((brand) => brand.image)
          : [];

        setBrands(formattedBrands);
      } catch (error) {
        console.error(
          "Error fetching affiliation brands:",
          error
        );

        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <div className="affiliations">
      <div className="affiliations-container">

        {/* =================================
            HEADER
        ================================= */}

        <Reveal className="affiliations-header">

          <div className="affiliations-heading">
            <span className="affiliations-eyebrow">
              Trusted Partners
            </span>

            <h2>Our Brands</h2>
          </div>

          <Link
            to="/brands"
            className="affiliations-viewall"
          >
            View All
            <span className="affiliations-arrow">
              →
            </span>
          </Link>

        </Reveal>

        {/* =================================
            LOADING
        ================================= */}

        {loading ? (

          <div className="affiliations-loading">
            Loading brands...
          </div>

        ) : (

          /* =================================
             BRAND GRID
          ================================= */

          <div className="affiliations-grid">

            {brands
              .slice(0, 7)
              .map((brand) => (

                <Link
                  key={brand.id}
                  to={`/products?brand=${encodeURIComponent(
                    brand.name
                  )}`}
                  className="affiliations-card"
                >

                  <img
                    src={brand.image}
                    alt={brand.name || "Brand"}
                    loading="lazy"
                  />

                </Link>

              ))}

          </div>

        )}

        {/* =================================
            EMPTY STATE
        ================================= */}

        {!loading && brands.length === 0 && (
          <div className="affiliations-empty">
            No brands available.
          </div>
        )}

      </div>
    </div>
  );
};