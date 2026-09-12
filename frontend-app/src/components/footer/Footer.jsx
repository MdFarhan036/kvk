import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

import api from "../api.js";

import "./Footer.css";
import footerImg from "../../assets/img/kvklogo1.png";

export const Footer = () => {
  const [categories, setCategories] = useState([]);
  const footerRef = useRef(null);

  // ============================================
  // CONTACT
  // ============================================
  const phoneNumber = "9308270123";

  const message =
    "Hello, I would like to Enquire about your services.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // ============================================
  // FETCH CATEGORIES
  // ============================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get(
          "/categories"
        );

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // ============================================
  // REVEAL ON SCROLL
  // ============================================
  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "in-view"
              );
            }
          });
        },
        {
          threshold: 0.15,
        }
      );

    const widgets =
      footerRef.current?.querySelectorAll(
        ".footer-widget, .footer-about"
      );

    widgets?.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // ============================================
  // FILTER CATEGORIES
  // ============================================
  const otherCategories =
    categories.filter(
      (category) =>
        !String(category.name || "")
          .toLowerCase()
          .includes("peanut")
    );

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      {/* ========================================
          FOOTER
      ======================================== */}
      <footer
        className="footer"
        ref={footerRef}
      >
        <div className="container">
          <div className="footer-area">

            <div className="footer-main">

              <div className="grid">

                {/* ==================================
                    ABOUT / LOGO
                ================================== */}
                <div
                  className="footer-about reveal"
                  style={{
                    "--delay": "0s",
                  }}
                >
                  <div className="footer-logo">
                    <div className="footer-img">
                      <Link to="/">
                        <img
                          src={footerImg}
                          alt="Krishi Vikash Kendra"
                        />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* ==================================
                    QUICK LINKS
                ================================== */}
                <div
                  className="footer-widget reveal"
                  style={{
                    "--delay": "0.1s",
                  }}
                >
                  <h3>
                    Quick Links
                  </h3>

                  <ul>
                    <li>
                      <Link to="/">
                        Home
                      </Link>
                    </li>

                    <li>
                      <Link to="/about">
                        About
                      </Link>
                    </li>

                    <li>
                      <Link to="/brands">
                        Brands
                      </Link>
                    </li>

                    <li>
                      <Link to="/contact">
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* ==================================
                    OTHER LINKS
                ================================== */}
                <div
                  className="footer-widget reveal"
                  style={{
                    "--delay": "0.2s",
                  }}
                >
                  <h3>
                    Other Links
                  </h3>

                  <ul>
                    <li>
                      <Link to="/profile">
                        My Account
                      </Link>
                    </li>

                    <li>
                      <Link to="/login">
                        Login
                      </Link>
                    </li>

                    <li>
                      <Link to="/signup">
                        Sign Up
                      </Link>
                    </li>

                    <li>
                      <Link to="/trackmyorder">
                        Track Order
                      </Link>
                    </li>

                    <li>
                      <Link to="/orders">
                        All Order
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* ==================================
                    PRODUCTS / CATEGORIES
                ================================== */}
                <div
                  className="footer-widget reveal"
                  style={{
                    "--delay": "0.3s",
                  }}
                >
                  <h3>
                    Our Products
                  </h3>

                  <ul>
                    {otherCategories.length >
                    0 ? (
                      otherCategories.map(
                        (category) => (
                          <li
                            key={category.id}
                          >
                            <Link
                              to={`/products-categories/${encodeURIComponent(
                                category.name
                              )}`}
                            >
                              {
                                category.name
                              }
                            </Link>
                          </li>
                        )
                      )
                    ) : (
                      <li>
                        No Products Available
                      </li>
                    )}
                  </ul>
                </div>

                {/* ==================================
                    CONTACT
                ================================== */}
                <div
                  className="footer-widget reveal"
                  style={{
                    "--delay": "0.4s",
                  }}
                >
                  <h3>
                    Contact Us
                  </h3>

                  <ul>

                    {/* WHATSAPP */}
                    <li>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa-brands fa-square-whatsapp"></i>

                        <span>
                          +91 930-827-0123
                        </span>
                      </a>
                    </li>

                    {/* EMAIL */}
                    <li>
                      <a href="mailto:krishivikashkendra@gmail.com">
                        <i className="fa fa-envelope"></i>

                        <span>
                          krishivikashkendra@gmail.com
                        </span>
                      </a>
                    </li>

                    {/* LOCATION */}
                    <li>
                      <a
                        href="https://www.google.com/maps?q=Chandwa,+Latehar,+Jharkhand"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa fa-map-marker-alt"></i>

                        <span>
                          Chandwa, Latehar,
                          Jharkhand
                        </span>
                      </a>
                    </li>

                  </ul>

                  {/* SOCIAL ICONS */}
                  <div className="footer-icon">

                    <a
                      className="footer-item"
                      href="#"
                      aria-label="Facebook"
                    >
                      <i className="fa-brands fa-facebook-f"></i>
                    </a>

                    <a
                      className="footer-item"
                      href="#"
                      aria-label="Instagram"
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>

                    <a
                      className="footer-item"
                      href="#"
                      aria-label="X"
                    >
                      <i className="fa-brands fa-x-twitter"></i>
                    </a>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* ========================================
          FOOTER BOTTOM
      ======================================== */}
      <div className="footer-bottom-wrapper">

        <div className="container">

          <div className="footer-row">

            {/* ==================================
                COPYRIGHT
            ================================== */}
            <div className="footer-col-left">

              <p className="footer-copy">
                © 2026{" "}

                <strong className="brand-text">
                  KRISHI VIKASH KENDRA
                </strong>

                {" "}— All rights reserved.
              </p>

            </div>

            {/* ==================================
                HOTLINE
            ================================== */}
            <div className="footer-col-center">

              <div className="hotline-item">

                <i className="fa-solid fa-phone-volume"></i>

                <p>
                  +91 93082 70123{" "}
                  <span>
                    8:00 AM – 10:00 PM
                  </span>
                </p>

              </div>

              <div className="hotline-item">

                <i className="fa-solid fa-headset"></i>

                <p>
                  +91 93082 70123{" "}
                  <span>
                    24/7 Support
                  </span>
                </p>

              </div>

            </div>

            {/* ==================================
                SOCIAL
            ================================== */}
            <div className="footer-col-right">

              <h6 className="footer-title">
                Follow Us
              </h6>

              <div className="footer-social">

                <a
                  href="#"
                  aria-label="Facebook"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>

                <a
                  href="#"
                  aria-label="Twitter"
                >
                  <i className="fa-brands fa-x-twitter"></i>
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>

                <a
                  href="#"
                  aria-label="Pinterest"
                >
                  <i className="fa-brands fa-pinterest-p"></i>
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                >
                  <i className="fa-brands fa-youtube"></i>
                </a>

              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};