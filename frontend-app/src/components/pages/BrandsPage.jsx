import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../api.js";

import "./BrandsPage.css";

export const BrandsPage = () => {
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
  // FETCH BRANDS FROM BACKEND
  // =================================

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/brands/public");

        const formattedBrands = Array.isArray(data)
          ? data.map((brand) => ({
              ...brand,

              // Normalize brand name
              name:
                brand.brand_name ||
                brand.name ||
                brand.brand ||
                "",

              // Normalize image URL
              image: getImageUrl(brand.image),
            }))
          : [];

        setBrands(formattedBrands);
      } catch (error) {
        console.error(
          "Error fetching brands:",
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
    <div className="brands-page">
      <div className="brands-container">

        {/* =================================
            PAGE HEADER
        ================================= */}

        <div className="brands-page-header">

          <div>
            <h2>Our Brands</h2>

            <p>
              Explore our trusted agricultural brands
            </p>
          </div>

          <Link
            to="/"
            className="back-btn"
          >
            ← Back to Home
          </Link>

        </div>

        {/* =================================
            LOADING
        ================================= */}

        {loading ? (

          <div className="brands-loading">
            Loading brands...
          </div>

        ) : brands.length > 0 ? (

          /* =================================
             BRANDS
          ================================= */

          <div className="brands-grid">

            {brands.map((brand) => (

              <Link
                key={brand.id}
                to={`/products?brand=${encodeURIComponent(
                  brand.name
                )}`}
                className="brand-card"
              >

                {brand.image ? (

                  <img
                    src={brand.image}
                    alt={brand.name}
                  />

                ) : (

                  <span className="brand-placeholder">
                    {brand.name}
                  </span>

                )}

              </Link>

            ))}

          </div>

        ) : (

          /* =================================
             EMPTY
          ================================= */

          <div className="no-brands">
            No brands available.
          </div>

        )}

      </div>
    </div>
  );
};