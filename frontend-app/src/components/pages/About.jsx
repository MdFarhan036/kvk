import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import aboutImg from "../../assets/img/about-banner.jpg";

import featurescardimg1 from "../../assets/img/icon-1.svg";
import featurescardimg2 from "../../assets/img/icon-2.svg";
import featurescardimg3 from "../../assets/img/icon-3.svg";
import featurescardimg4 from "../../assets/img/icon-4.svg";
import featurescardimg5 from "../../assets/img/icon-5.svg";
import featurescardimg6 from "../../assets/img/icon-6.svg";

import "./about.css";

export const About = () => {
  const aboutfeatures = [
    {
      id: 1,
      icon: featurescardimg1,
      title: "Quality Agricultural Products",
      description:
        "We provide reliable agricultural products designed to support farmers and meet their day-to-day farming requirements.",
    },
    {
      id: 2,
      icon: featurescardimg2,
      title: "Wide Product Range",
      description:
        "Explore a variety of agricultural categories including seeds, fertilizers, crop protection products and farming essentials.",
    },
    {
      id: 3,
      icon: featurescardimg3,
      title: "Reliable Service",
      description:
        "We focus on providing dependable service and a smooth experience for farmers, customers and agricultural businesses.",
    },
    {
      id: 4,
      icon: featurescardimg4,
      title: "Expert Guidance",
      description:
        "Our platform helps customers explore suitable agricultural products and make informed decisions for their requirements.",
    },
    {
      id: 5,
      icon: featurescardimg5,
      title: "Customer Satisfaction",
      description:
        "Customer satisfaction is at the center of our service, with a focus on quality, reliability and long-term trust.",
    },
    {
      id: 6,
      icon: featurescardimg6,
      title: "Trusted Agricultural Partner",
      description:
        "Krishi Vikas Kendra aims to become a trusted platform connecting customers with essential agricultural products.",
    },
  ];

  const performanceCards = [
    {
      title: "Who We Are",
      description:
        "Krishi Vikas Kendra is focused on making agricultural products more accessible and convenient for farmers and customers.",
    },
    {
      title: "Our Approach",
      description:
        "We focus on quality products, reliable service and a simple platform that helps customers find agricultural essentials easily.",
    },
    {
      title: "Our Mission",
      description:
        "Our mission is to support agriculture by improving access to useful products, dependable services and modern solutions.",
    },
  ];

  const stats = [
    { count: 12, label: "Years of Experience" },
    { count: 500, label: "Happy Customers" },
    { count: 100, label: "Products Available" },
    { count: 10, label: "Product Categories" },
    { count: 5, label: "Expert Advisors" },
  ];

  const [counts, setCounts] = useState({});
  const countRef = useRef(null);
  const hasAnimated = useRef(false);

  /* =================================
     COUNT-UP ANIMATION
  ================================= */

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;

        hasAnimated.current = true;

        stats.forEach((item, index) => {
          let start = 0;

          const duration = 1200;
          const stepTime = 16;
          const steps = duration / stepTime;
          const increment = item.count / steps;

          const timer = setInterval(() => {
            start += increment;

            if (start >= item.count) {
              start = item.count;
              clearInterval(timer);
            }

            setCounts((prev) => ({
              ...prev,
              [index]: Math.floor(start),
            }));
          }, stepTime);
        });
      },
      {
        threshold: 0.4,
      }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /* =================================
     3D CARD HOVER EFFECT
  ================================= */

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll(
      ".about-features-card, .team-card"
    );

    const handleMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `
        translateY(-8px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    };

    const handleLeave = (e) => {
      e.currentTarget.style.transform =
        "translateY(0) rotateX(0deg) rotateY(0deg)";
    };

    cards.forEach((card) => {
      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mousemove", handleMove);
        card.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  return (
    <>
      {/* =================================
          ABOUT INTRODUCTION
      ================================= */}

      <section className="aboutus">
        <div className="about-container">
          <div className="about-row">
            <div className="about-cont">
              <section className="about-upper">
                <div className="about-upper-img">
                  <img
                    src={aboutImg}
                    alt="Krishi Vikas Kendra"
                  />
                </div>

                <div className="about-upper-content">
                  <h2 className="about-upper-content-title">
                    Welcome to Krishi Vikas Kendra
                  </h2>

                  <p className="about-upper-content-desc">
                    Krishi Vikas Kendra is dedicated to supporting agriculture
                    by providing access to a wide range of useful agricultural
                    products and farming essentials. Our platform is designed
                    to make it easier for farmers and customers to explore
                    products according to their agricultural requirements.
                  </p>

                  <p className="about-upper-content-desc">
                    We believe that reliable agricultural products and quality
                    service can help support better farming practices. Our goal
                    is to build a trusted platform where customers can discover
                    agricultural categories, explore products and connect with
                    the services they need.
                  </p>
                </div>
              </section>


              {/* =================================
                  FEATURES
              ================================= */}

              <section className="about-features">
                <h2 className="about-features-title">
                  What We Provide
                </h2>

                <div className="about-features-row">
                  {aboutfeatures.map((feature) => (
                    <div
                      className="about-features-container"
                      key={feature.id}
                    >
                      <div className="about-features-card">
                        <img
                          src={feature.icon}
                          alt={feature.title}
                        />

                        <div className="about-features-content">
                          <h4>{feature.title}</h4>

                          <p>{feature.description}</p>

                          <Link
                            className="about-learnmore"
                            to="/products"
                          >
                            Explore Products
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>


      {/* =================================
          OUR STORY / PERFORMANCE
      ================================= */}

      <section className="our-performance">
        <div className="our-performance-row align-items-center">
          <div className="our-performance-description">
            <img
              src={aboutImg}
              alt="Agriculture and farming"
            />
          </div>

          <div className="our-performance-description">
            <h4 className="mb-20 text-muted">
              Our Commitment
            </h4>

            <h1 className="heading-1 mb-40">
              Your Trusted Partner for Agricultural Products and Services
            </h1>

            <p className="mb-30">
              Krishi Vikas Kendra is committed to helping farmers and
              customers access agricultural products through a simple and
              reliable platform. We aim to make product discovery easier and
              support customers in finding solutions for their farming needs.
            </p>

            <p>
              By bringing agricultural products and services together, we
              strive to create a convenient experience while building trust
              through quality, reliability and customer-focused service.
            </p>
          </div>
        </div>


        {/* =================================
            WHO WE ARE / MISSION
        ================================= */}

        <div className="our-performance-sub-row">
          {performanceCards.map((item, index) => (
            <div
              className="sub-card"
              key={index}
            >
              <h3 className="mb-30">
                {item.title}
              </h3>

              <p>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* =================================
          STATISTICS
      ================================= */}

  <section
  className="count-section"
  ref={countRef}
>
        <div className="about-count">
          {stats.map((item, index) => (
            <div
              className="about-count-item"
              key={index}
            >
              <h1 className="heading-1">
                <span className="count">
                  {counts[index] ?? 0}
                </span>
                +
              </h1>

              <h4>
                {item.label}
              </h4>
            </div>
          ))}
        </div>
      </section>


      {/* =================================
          TEAM
      ================================= */}

      <section className="team">
        <h2 className="team-title">
          Our Team
        </h2>

        <div className="team-layout">
          <div className="team-intro">
            <h6 className="team-subtitle">
              Our Team
            </h6>

            <h1 className="team-heading">
              Meet Our Dedicated Team
            </h1>

            <p>
              Our team is committed to supporting the vision of Krishi Vikas
              Kendra and building a reliable platform for agricultural
              products and services.
            </p>

            <p>
              We work with a customer-focused approach and aim to improve the
              experience of discovering and accessing essential agricultural
              products.
            </p>

            <Link
              to="/contact"
              className="team-btn"
            >
              Contact Our Team
            </Link>
          </div>


          <div className="team-row">
            {[
              {
                img: "about-6.png",
                name: "Team Member",
                title: "Agricultural Services",
              },
              {
                img: "about-8.png",
                name: "Team Member",
                title: "Customer Support",
              },
            ].map((member, index) => (
              <div
                className="team-card"
                key={index}
              >
                <img
                  src={`/assets/imgs/page/${member.img}`}
                  alt={member.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";

                    const fallback =
                      e.currentTarget.nextElementSibling;

                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />

                <div
                  className="team-avatar-fallback"
                  aria-hidden="true"
                >
                  {member.name.charAt(0)}
                </div>

                <div className="content">
                  <h4>
                    {member.name}
                  </h4>

                  <span>
                    {member.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};