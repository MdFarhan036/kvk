import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../../api.js";

import BlogCard from "./BlogCard";
import "./SingleBlog.css";

/* =========================================================
   SANITIZE BLOG HTML
========================================================= */

const sanitizeBlogHtml = (html) => {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    html,
    "text/html"
  );

  const body = doc.body;

  const firstH2 = body.querySelector("h2");

  if (
    firstH2 &&
    !firstH2.closest("[id]")
  ) {
    const parentDiv = firstH2.parentElement;

    if (
      parentDiv === body ||
      (parentDiv && !parentDiv.id)
    ) {
      if (
        parentDiv !== body &&
        parentDiv.children.length === 1
      ) {
        parentDiv.remove();
      } else if (parentDiv === body) {
        firstH2.remove();
      }
    }
  }

  const CTA_PHRASES = [
    "related article",
    "also read",
    "check out",
    "explore more",
    "common application form",
    "fill the common application form",
    "stop stressing. start applying",
    "one form · multiple colleges",
    "one form. multiple colleges",
  ];

  const isCTAText = (text) => {
    const lower = (text || "")
      .toLowerCase()
      .trim();

    return CTA_PHRASES.some((phrase) =>
      lower.includes(phrase)
    );
  };

  const allElements = Array.from(
    body.querySelectorAll("div, p")
  );

  allElements.forEach((el) => {
    const text = el.textContent || "";

    if (isCTAText(text)) {
      el.remove();
      return;
    }

    const style =
      el.getAttribute("style") || "";

    if (
      style.includes("linear-gradient") &&
      (
        style.includes("#3730a3") ||
        style.includes("#4f46e5") ||
        style.includes("#6366f1")
      )
    ) {
      el.remove();
    }
  });

  Array.from(
    body.querySelectorAll("a")
  ).forEach((a) => {
    const aStyle =
      a.getAttribute("style") || "";

    if (
      aStyle.includes(
        "background:#3730a3"
      ) ||
      aStyle.includes(
        "background: #3730a3"
      ) ||
      aStyle.includes(
        "background:linear-gradient"
      ) ||
      aStyle.includes(
        "background: linear-gradient"
      )
    ) {
      let target = a;

      while (
        target.parentElement &&
        target.parentElement !== body &&
        target.parentElement.textContent
          .trim()
          .replace(/\s+/g, " ") ===
          target.textContent
            .trim()
            .replace(/\s+/g, " ")
      ) {
        target = target.parentElement;
      }

      const prev =
        target.previousElementSibling;

      if (
        prev &&
        isCTAText(prev.textContent)
      ) {
        prev.remove();
      }

      target.remove();
    }
  });

  Array.from(
    body.querySelectorAll("h2[style]")
  ).forEach((h2) => {
    if (!h2.closest("[id]")) {
      h2.remove();
    }
  });

  return body.innerHTML;
};

/* =========================================================
   SINGLE BLOG
========================================================= */

const SingleBlog = () => {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [notFound, setNotFound] =
    useState(false);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getImageUrl = (url) => {
    if (!url) {
      return "/default-blog.jpg";
    }

    // Already a complete URL
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // Relative image URL
    return `${ASSET_BASE_URL}${
      url.startsWith("/") ? "" : "/"
    }${url}`;
  };

  const getDisplayDate = (blogData) => {
    const date =
      blogData.published_at ||
      blogData.created_at;

    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    return `${d.getDate()}/${
      d.getMonth() + 1
    }/${d.getFullYear()}`;
  };

  const formatReadTime = (readingTime) => {
    if (!readingTime) return null;

    const cleaned = String(readingTime)
      .replace(/\s*min\s*read/gi, "")
      .trim();

    return `${cleaned} min read`;
  };

  /* =========================================================
     FETCH SINGLE BLOG
  ========================================================= */

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      const res = await api.get(
        `/blogs/${slug}`
      );

      const blogData =
        res.data.blog || res.data;

      setBlog(blogData);
    } catch (err) {
      console.error(
        "Error loading blog:",
        err
      );

      if (
        err.response?.status === 404
      ) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH RECENT BLOGS
  ========================================================= */

  const fetchRecentBlogs = async () => {
    try {
      const res =
        await api.get("/blogs");

      const filtered = (
        Array.isArray(res.data)
          ? res.data
          : []
      )
        .filter(
          (item) =>
            item.slug !== slug
        )
        .sort((a, b) => {
          if (
            Number(b.featured) !==
            Number(a.featured)
          ) {
            return (
              Number(b.featured) -
              Number(a.featured)
            );
          }

          return (
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
          );
        });

      setRecentBlogs(
        filtered.slice(0, 4)
      );
    } catch (err) {
      console.error(
        "Error loading recent blogs:",
        err
      );

      setRecentBlogs([]);
    }
  };

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!slug) return;

    fetchBlog();
    fetchRecentBlogs();
  }, [slug]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="singleblog__section">
        <div className="singleblog__container">
          <div className="singleblog__layout">

            <div className="singleblog__content">
              <div className="singleblog__skeleton-hero" />

              <div className="singleblog__skeleton-body">
                <div
                  className="singleblog__skeleton-line"
                  style={{
                    width: "60%",
                  }}
                />

                <div className="singleblog__skeleton-line" />

                <div className="singleblog__skeleton-line" />

                <div
                  className="singleblog__skeleton-line"
                  style={{
                    width: "80%",
                  }}
                />
              </div>
            </div>

            <aside className="singleblog__sidebar">
              <div className="singleblog__sidebar-header">
                <span className="singleblog__sidebar-label">
                  Recent Posts
                </span>
              </div>

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="singleblog__skeleton-sidebar"
                />
              ))}
            </aside>

          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (notFound || !blog) {
    return (
      <section className="singleblog__section">
        <div className="singleblog__container">

          <div className="singleblog__notfound">

            <div className="singleblog__notfound-icon">
              📄
            </div>

            <h2 className="singleblog__notfound-title">
              Blog Not Found
            </h2>

            <p className="singleblog__notfound-text">
              This article may have been moved
              or is no longer available.
            </p>

            <Link
              to="/blog"
              className="singleblog__back-btn"
            >
              ← Back to Blog
            </Link>

          </div>

        </div>
      </section>
    );
  }

  const displayReadTime =
    formatReadTime(
      blog.reading_time
    );

  const cleanContent =
    sanitizeBlogHtml(
      blog.content
    );

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <section className="singleblog__section">

      <div className="singleblog__container">

        <div className="singleblog__layout">

          {/* =================================================
              ARTICLE
          ================================================= */}

          <article className="singleblog__content">

            {/* HERO */}

            <div className="singleblog__hero">

              <img
                src={getImageUrl(
                  blog.image_url
                )}
                alt={
                  blog.title || "Blog"
                }
                className="singleblog__hero-img"
              />

              <div className="singleblog__hero-overlay" />

              {blog.category && (
                <span className="singleblog__category-badge">
                  {blog.category}
                </span>
              )}

              <div className="singleblog__hero-bottom">

                <h1 className="singleblog__title">
                  {blog.title}
                </h1>

              </div>

            </div>

            {/* =================================================
                META
            ================================================= */}

            <div className="singleblog__meta-row">

              <div className="singleblog__meta-left">

                {getDisplayDate(blog) && (
                  <span className="singleblog__meta-item">
                    📅{" "}
                    {getDisplayDate(blog)}
                  </span>
                )}

                {displayReadTime && (
                  <span className="singleblog__meta-item">
                    🕒{" "}
                    {displayReadTime}
                  </span>
                )}

                {blog.author_name && (
                  <span className="singleblog__meta-item">
                    👤{" "}
                    {blog.author_name}
                  </span>
                )}

              </div>

              {blog.tags && (
                <div className="singleblog__tags">

                  {blog.tags
                    .split(",")
                    .filter(Boolean)
                    .map(
                      (tag, index) => (
                        <span
                          key={index}
                          className="singleblog__tag"
                        >
                          {tag.trim()}
                        </span>
                      )
                    )}

                </div>
              )}

            </div>

            {/* =================================================
                BLOG CONTENT
            ================================================= */}

            <div
              className="singleblog__body"
              dangerouslySetInnerHTML={{
                __html: cleanContent,
              }}
            />

            {/* =================================================
                BACK
            ================================================= */}

            <div className="singleblog__nav">

              <Link
                to="/blog"
                className="singleblog__back-btn"
              >
                ← Back to Blog
              </Link>

            </div>

          </article>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="singleblog__sidebar">

            <div className="singleblog__sidebar-header">

              <span className="singleblog__sidebar-label">
                Recent Posts
              </span>

            </div>

            {recentBlogs.length > 0 ? (

              <div className="singleblog__sidebar-list">

                {recentBlogs.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="singleblog__sidebar-item"
                      style={{
                        animationDelay: `${
                          index * 0.1
                        }s`,
                      }}
                    >
                      <BlogCard
                        title={item.title}
                        slug={item.slug}
                        excerpt={item.excerpt}
                        image_url={
                          item.image_url
                        }
                        category={
                          item.category
                        }
                        reading_time={
                          item.reading_time
                        }
                        author_name={
                          item.author_name
                        }
                        published_at={
                          item.published_at
                        }
                        created_at={
                          item.created_at
                        }
                        variant="sidebar"
                      />
                    </div>
                  )
                )}

              </div>

            ) : (

              <p className="singleblog__sidebar-empty">
                No recent posts.
              </p>

            )}

            <div className="singleblog__sidebar-footer">

              <Link
                to="/blog"
                className="singleblog__viewall-btn"
              >
                View All Articles →
              </Link>

            </div>

          </aside>

        </div>

      </div>

    </section>
  );
};

export default SingleBlog;