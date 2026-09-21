import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

import BlogCard from "./BlogCard";
import "./BlogsCarousel.css";

import api from "../../api.js";

/* =========================================================
   CURRENT WINDOW WIDTH HOOK
========================================================= */

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
}

/* =========================================================
   VIEW ALL MODAL
========================================================= */

const ViewAllModal = ({ blogs, onClose }) => {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 640;

  /* =================================
     ESCAPE + BODY SCROLL LOCK
  ================================= */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="bcm__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bcm__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-articles-title"
      >
        {/* =================================
            HEADER
        ================================= */}

        <div className="bcm__header">
          <div
            className="bcm__handle"
            aria-hidden="true"
          />

          <div className="bcm__header-row">
            <h2
              id="all-articles-title"
              className="bcm__title"
            >
              All <span>Articles</span>
            </h2>

            <button
              type="button"
              className="bcm__close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* =================================
            MODAL BODY
        ================================= */}

        <div className="bcm__body">
          {blogs.length === 0 ? (
            <div className="bcm__empty">
              <strong>No articles found</strong>
            </div>
          ) : isMobile ? (
            /* =================================
               MOBILE LIST
            ================================= */

            <div className="bcm__list">
              {blogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="bcm__list-item"
                  style={{
                    animationDelay: `${Math.min(
                      index * 0.04,
                      0.3
                    )}s`,
                  }}
                  onClick={onClose}
                >
                  <BlogCard
                    title={blog.title}
                    slug={blog.slug}
                    excerpt={blog.excerpt}
                    image_url={blog.image_url}
                    thumbnail_url={blog.thumbnail_url}
                    category={blog.category}
                    reading_time={blog.reading_time}
                    author_name={blog.author_name}
                    published_at={blog.published_at}
                    created_at={blog.created_at}
                    variant="sidebar"
                  />
                </div>
              ))}
            </div>
          ) : (
            /* =================================
               DESKTOP GRID
            ================================= */

            <div className="bcm__grid">
              {blogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="bcm__grid-item"
                  style={{
                    animationDelay: `${Math.min(
                      index * 0.05,
                      0.4
                    )}s`,
                  }}
                  onClick={onClose}
                >
                  <BlogCard
                    title={blog.title}
                    slug={blog.slug}
                    excerpt={blog.excerpt}
                    image_url={blog.image_url}
                    thumbnail_url={blog.thumbnail_url}
                    category={blog.category}
                    reading_time={blog.reading_time}
                    author_name={blog.author_name}
                    published_at={blog.published_at}
                    created_at={blog.created_at}
                    variant="grid"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

/* =========================================================
   BLOGS CAROUSEL
========================================================= */

const BlogsCarousel = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* =================================
     FETCH BLOGS
  ================================= */

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/blogs");

      const filtered = (
        Array.isArray(data) ? data : []
      )
        .filter(
          (blog) =>
            Number(blog.is_active) === 1 &&
            blog.status === "published"
        )
        .sort((a, b) => {
          // Featured blogs first
          if (
            Number(b.featured) !==
            Number(a.featured)
          ) {
            return (
              Number(b.featured) -
              Number(a.featured)
            );
          }

          // Then sort order
          return (
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
          );
        });

      setBlogs(filtered);
      setError(null);
    } catch (err) {
      console.error(
        "Error loading blogs:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load blogs."
      );

      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  /* =================================
     INITIAL FETCH
  ================================= */

  useEffect(() => {
    fetchBlogs();
  }, []);

  /* =================================
     MODAL HANDLERS
  ================================= */

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  /* =================================
     HERO BANNER
  ================================= */

  const HeroBanner = () => (
    <div className="blogcarousel__hero">
      <div className="blogcarousel__hero-content">
        <h1 className="blogcarousel__hero-title">
          Our Blog &amp; Insights
        </h1>

        <p className="blogcarousel__hero-subtitle">
          Latest updates from Agriculture
        </p>
      </div>
    </div>
  );

  /* =================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <section className="blogcarousel__section">
        <div className="blogcarousel__container">
          <HeroBanner />

          <div className="blogcarousel__layout">
            <div className="blogcarousel__skeleton-featured" />

            <div className="blogcarousel__sidebar">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="blogcarousel__skeleton-sidebar"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* =================================
     ERROR
  ================================= */

  if (error) {
    return (
      <section className="blogcarousel__section">
        <div className="blogcarousel__container">
          <HeroBanner />

          <div className="blogcarousel__error">
            {error}
          </div>
        </div>
      </section>
    );
  }

  /* =================================
     NO BLOGS
  ================================= */

  if (!blogs.length) {
    return null;
  }

  /* =================================
     FEATURED + SIDEBAR
  ================================= */

  const featured = blogs[0];

  // Maximum 3 recent posts
  const sidebarBlogs = blogs.slice(1, 4);

  return (
    <>
      <section className="blogcarousel__section">
        <div className="blogcarousel__container">
          <HeroBanner />

          <div className="blogcarousel__layout">
            {/* =================================
                FEATURED BLOG
            ================================= */}

            {featured && (
              <div className="blogcarousel__featured">
                <BlogCard
                  title={featured.title}
                  slug={featured.slug}
                  excerpt={featured.excerpt}
                  image_url={featured.image_url}
                  thumbnail_url={
                    featured.thumbnail_url
                  }
                  category={featured.category}
                  reading_time={
                    featured.reading_time
                  }
                  author_name={
                    featured.author_name
                  }
                  published_at={
                    featured.published_at
                  }
                  created_at={featured.created_at}
                  featured={true}
                  variant="featured"
                />
              </div>
            )}

            {/* =================================
                SIDEBAR
            ================================= */}

            <div className="blogcarousel__sidebar">
              <div className="blogcarousel__sidebar-header">
                <span className="blogcarousel__sidebar-label">
                  Recent Posts
                </span>

                <button
                  type="button"
                  className="blogcarousel__viewall-btn"
                  onClick={openModal}
                  aria-label={`View all ${blogs.length} articles`}
                >
                  View All ({blogs.length})
                </button>
              </div>

              {sidebarBlogs.length > 0 ? (
                sidebarBlogs.map((blog, index) => (
                  <div
                    key={blog.id}
                    className="blogcarousel__sidebar-item"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <BlogCard
                      title={blog.title}
                      slug={blog.slug}
                      excerpt={blog.excerpt}
                      image_url={blog.image_url}
                      thumbnail_url={
                        blog.thumbnail_url
                      }
                      category={blog.category}
                      reading_time={
                        blog.reading_time
                      }
                      author_name={
                        blog.author_name
                      }
                      published_at={
                        blog.published_at
                      }
                      created_at={blog.created_at}
                      featured={false}
                      variant="sidebar"
                    />
                  </div>
                ))
              ) : (
                <div className="blogcarousel__sidebar-empty">
                  No more recent articles.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          VIEW ALL MODAL
      ================================= */}

      {showModal && (
        <ViewAllModal
          blogs={blogs}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default BlogsCarousel;
