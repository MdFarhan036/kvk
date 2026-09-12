import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api";
import DOMPurify from "dompurify";

export const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [currentImage, setCurrentImage] = useState("");

  // =====================================================
  // FETCH PRODUCT + TABS
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, tabsRes] =
          await Promise.all([
            api.get(`/products/${id}`),
            api.get(`/products/${id}/tabs`),
          ]);

        const p = productRes.data;

        setProduct(p);
        setTabs(tabsRes.data);

        setCurrentImage(
          p.images?.[0]
            ? `${ASSET_BASE_URL}${p.images[0]}`
            : "/placeholder.png"
        );
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchData();
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (!product) {
    return <p>Loading...</p>;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="product-details-page">

      {/* =================================================
          IMAGES
      ================================================= */}

      <div className="product-details-container">

        <div className="product-images">

          {/* MAIN IMAGE */}

          <div className="main-image">
            <img
              src={currentImage}
              alt={product.title}
            />
          </div>

          {/* THUMBNAILS */}

          <div className="thumbnail-images">

            {product.images?.map(
              (img, idx) => {
                const imageUrl =
                  `${ASSET_BASE_URL}${img}`;

                return (
                  <img
                    key={idx}
                    src={imageUrl}
                    className={`thumbnail ${
                      currentImage === imageUrl
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentImage(imageUrl)
                    }
                    alt={`${product.title} ${idx + 1}`}
                  />
                );
              }
            )}

          </div>
        </div>

        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div className="product-info">

          <h2>{product.title}</h2>

          <p>{product.brand}</p>

          <p>
            {product.category_name}
          </p>

          <p className="price">
            ₹{product.price}
          </p>

          {product.oldPrice && (
            <p className="old-price">
              ₹{product.oldPrice}
            </p>
          )}

          <p className="stock">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of Stock"}
          </p>

          {/* SHORT DESCRIPTION */}

          {product.subdescription && (
            <p className="subdesc">
              {product.subdescription}
            </p>
          )}

        </div>

      </div>

      {/* =================================================
          PRODUCT TABS
      ================================================= */}

      <div className="product-tabs">

        {/* TAB HEADERS */}

        <div className="tabs-header">

          {tabs.map((tab, i) => (
            <button
              key={i}
              type="button"
              className={
                activeTab === i
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(i)
              }
            >
              {tab.title}
            </button>
          ))}

        </div>

        {/* TAB CONTENT */}

        <div className="tabs-content">

          <div
            dangerouslySetInnerHTML={{
              __html:
                DOMPurify.sanitize(
                  tabs[activeTab]?.content ||
                    ""
                ),
            }}
          />

        </div>

      </div>

      {/* =================================================
          FALLBACK DESCRIPTION
      ================================================= */}

      {!tabs.length && (
        <div className="product-description">

          <div
            dangerouslySetInnerHTML={{
              __html:
                DOMPurify.sanitize(
                  product.description ||
                    ""
                ),
            }}
          />

        </div>
      )}

      {/* =================================================
          EXTRA INFORMATION
      ================================================= */}

      <div className="product-extra">

        <ul>

          {product.size && (
            <li>
              Size: {product.size}
            </li>
          )}

          {product.weight && (
            <li>
              Weight: {product.weight}
            </li>
          )}

          {product.type && (
            <li>
              Type: {product.type}
            </li>
          )}

          {product.mfg && (
            <li>
              MFG: {product.mfg}
            </li>
          )}

          {product.tags && (
            <li>
              Tags: {product.tags}
            </li>
          )}

          {product.life && (
            <li>
              Life: {product.life}
            </li>
          )}

        </ul>

      </div>

      {/* =================================================
          VENDOR
      ================================================= */}

      <div className="vendor-card">

        <h3>Vendor Info</h3>

        {product.vendorName ? (
          <>
            <p>{product.vendorName}</p>
            <p>{product.contactPerson}</p>
            <p>{product.vendorEmail}</p>
          </>
        ) : (
          <p>No vendor linked</p>
        )}

      </div>

    </div>
  );
};