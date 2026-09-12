import { useState } from "react";
import { ASSET_BASE_URL } from "../../api.js";

const ProductGallery = ({ product }) => {
  const getImageUrl = (url) => {
    if (!url) return null;

    if (typeof url !== "string") return null;

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${ASSET_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const firstImage = product?.images?.[0]
    ? getImageUrl(product.images[0])
    : null;

  const [activeImage, setActiveImage] = useState(firstImage);

  const [zoomPosition, setZoomPosition] = useState({
    x: 0,
    y: 0,
    visible: false,
  });

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.target.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({
      x,
      y,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setZoomPosition((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <>
      <div
        className="producat_wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {activeImage && (
          <img
            src={activeImage}
            alt={product?.name || product?.title || "Product"}
            className="detailshome-main-image"
          />
        )}

        {zoomPosition.visible && activeImage && (
          <div
            className="detailshome-image-zoom-lens"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        )}
      </div>

      <div className="detailshome-image-gallery">
        {product?.images?.map((img, idx) => {
          const imageUrl = getImageUrl(img);

          if (!imageUrl) return null;

          return (
            <img
              key={idx}
              src={imageUrl}
              alt={`Product ${idx + 1}`}
              onClick={() => setActiveImage(imageUrl)}
              className={
                activeImage === imageUrl
                  ? "detailshomeimageactive"
                  : ""
              }
            />
          );
        })}
      </div>
    </>
  );
};

export default ProductGallery;