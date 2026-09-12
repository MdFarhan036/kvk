import { useEffect, useState } from "react";
import "./HomeCarousel.css";

import api, { ASSET_BASE_URL } from "../api.js";

export const HomeCarousel = ({ interval = 3000 }) => {
  const [sliderimage, setSliderimage] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ============================================
  // IMAGE URL
  // ============================================

  const getImageUrl = (image) => {
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  // ============================================
  // FETCH CAROUSEL FROM API
  // ============================================

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        setLoading(true);

   const { data } = await api.get("/carousel/public");

        const slides = Array.isArray(data)
          ? data
          : data?.slides || data?.carousel || data?.data || [];

        const formattedSlides = slides
          .filter((slide) => {
            // Support both status and is_active
            if (slide.status !== undefined) {
              return (
                slide.status === "active" ||
                slide.status === "Active" ||
                slide.status === 1 ||
                slide.status === true
              );
            }

            if (slide.is_active !== undefined) {
              return (
                slide.is_active === 1 ||
                slide.is_active === true
              );
            }

            return true;
          })
          .sort(
            (a, b) =>
              Number(a.sort_order || 0) -
              Number(b.sort_order || 0)
          )
          .map((slide, index) => ({
            id: slide.id || index + 1,
            image: getImageUrl(slide.image),
            title:
              slide.title ||
              `Slide ${index + 1}`,
          }))
          .filter((slide) => slide.image);

        setSliderimage(formattedSlides);
        setCurrentIndex(0);
      } catch (error) {
        console.error(
          "❌ Error fetching homepage carousel:",
          error
        );

        setSliderimage([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarousel();
  }, []);

  // ============================================
  // AUTO SLIDE
  // ============================================

  useEffect(() => {
    if (sliderimage.length <= 1) {
      return;
    }

    const autoSlide = setInterval(() => {
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex + 1) % sliderimage.length
      );
    }, interval);

    return () => clearInterval(autoSlide);
  }, [interval, sliderimage.length]);

  // ============================================
  // PREVIOUS SLIDE
  // ============================================

  const prevSlide = () => {
    if (sliderimage.length === 0) return;

    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? sliderimage.length - 1
        : prevIndex - 1
    );
  };

  // ============================================
  // NEXT SLIDE
  // ============================================

  const nextSlide = () => {
    if (sliderimage.length === 0) return;

    setCurrentIndex(
      (prevIndex) =>
        (prevIndex + 1) % sliderimage.length
    );
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="carousel_container">
        <div className="carousel_inner">
          <div className="carousel_item active_carousel">
            <div className="carousel-loading">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // NO SLIDES
  // ============================================

  if (sliderimage.length === 0) {
    return null;
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="carousel_container">

      <div className="carousel_inner">

        {sliderimage.map((slideritem, index) => (
          <div
            key={slideritem.id}
            className={`carousel_item ${
              index === currentIndex
                ? "active_carousel"
                : ""
            }`}
          >
            <img
              src={slideritem.image}
              alt={
                slideritem.title ||
                `Slide ${slideritem.id}`
              }
            />
          </div>
        ))}

      </div>

      {/* ==========================================
          CONTROLS
      ========================================== */}

      {sliderimage.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="prevbutton"
            aria-label="Previous slide"
          >
            &#10094;
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="nextbutton"
            aria-label="Next slide"
          >
            &#10095;
          </button>

          {/* ========================================
              DOTS
          ======================================== */}

          <div className="carousel__dots">
            {sliderimage.map((_, index) => (
              <span
                key={index}
                className={`dot ${
                  index === currentIndex
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCurrentIndex(index)
                }
                role="button"
                tabIndex={0}
                aria-label={`Go to slide ${
                  index + 1
                }`}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    setCurrentIndex(index);
                  }
                }}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
};