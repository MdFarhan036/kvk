import React, { useEffect, useState } from "react";
import "./HomeCarousel.css";
import publicApi from "../api";

export const HomeCarousel = ({ interval = 3000 }) => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    publicApi.get("/carousel/public").then(res => {
      setSlides(res.data || []);
    });
  }, []);

  useEffect(() => {
    if (!slides.length) return;

    const timer = setInterval(() => {
      setCurrentIndex(i => (i + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, slides.length]);

  if (!slides.length) return null;

  return (
    <div className="carousel_container">
      <div className="carousel_inner">
        {slides.map((s, i) => (
          <div key={s.id} className={`carousel_item ${i === currentIndex ? "active_carousel" : ""}`}>
            <img src={`http://localhost:8000${s.image}`} alt={s.title || ""} />
          </div>
        ))}
      </div>
    </div>
  );
};
