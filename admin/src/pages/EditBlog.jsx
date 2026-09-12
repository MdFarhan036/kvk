import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { ASSET_BASE_URL } from "./api";

import "./BlogAdmin.css";

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: "",
  author_name: "",
  reading_time: "",
  meta_title: "",
  meta_description: "",
  sort_order: 1,
  is_active: 1,
  featured: 0,
  status: "draft",
  published_at: "",
};

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [currentImage, setCurrentImage] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showPreview, setShowPreview] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================
  // FETCH BLOG
  // ============================================
  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        `/admin/blogs/${id}`
      );

      const blog = data.blog || data;

      setForm({
        title: blog.title || "",
        slug: blog.slug || "",
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        category: blog.category || "",
        tags: blog.tags || "",
        author_name: blog.author_name || "",
        reading_time: blog.reading_time || "",
        meta_title: blog.meta_title || "",
        meta_description:
          blog.meta_description || "",
        sort_order: blog.sort_order ?? 1,
        is_active:
          Number(blog.is_active) === 1 ? 1 : 0,
        featured:
          Number(blog.featured) === 1 ? 1 : 0,
        status: blog.status || "draft",
        published_at:
          blog.published_at || "",
      });

      setCurrentImage(
        blog.image_url ||
          blog.image ||
          ""
      );
    } catch (err) {
      console.error(
        "❌ Error fetching blog:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load blog."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  // ============================================
  // HANDLE CHANGE
  // ============================================
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : value,
    }));
  };

  // ============================================
  // TITLE → SLUG
  // ============================================
  const handleTitleChange = (e) => {
    const title = e.target.value;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setForm((prev) => ({
      ...prev,
      title,
      slug,
    }));
  };

  // ============================================
  // IMAGE CHANGE
  // ============================================
  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0] || null;

    setSelectedImage(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (file) {
      const previewUrl =
        URL.createObjectURL(file);

      setImagePreview(previewUrl);
    } else {
      setImagePreview("");
    }
  };

  // ============================================
  // UPDATE BLOG
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          formData.append(
            key,
            value ?? ""
          );
        }
      );

      if (selectedImage) {
        formData.append(
          "image",
          selectedImage
        );
      }

      await api.put(
        `/admin/blogs/${id}`,
        formData
      );

      alert(
        "Blog updated successfully!"
      );

      navigate("/blogs");
    } catch (err) {
      console.error(
        "❌ Update blog error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update blog."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // CLEAN IMAGE PREVIEW
  // ============================================
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ============================================
  // IMAGE URL
  // ============================================
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    return `${ASSET_BASE_URL}${imageUrl}`;
  };

  // ============================================
  // PREVIEW IMAGE
  // ============================================
  const previewImage =
    imagePreview ||
    getImageUrl(currentImage);

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <main className="blog-admin-page">
        <div className="blog-loading">
          Loading blog...
        </div>
      </main>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <main className="blog-admin-page">

      {/* HEADER */}
      <div className="blog-admin-header">
        <div>
          <h1>Edit Blog</h1>

          <p>
            Update your blog post.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="blog-error"
          style={{
            color: "#dc2626",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        className="blog-admin-form"
        onSubmit={handleSubmit}
      >

        {/* BASIC INFORMATION */}
        <div className="blog-form-grid">

          {/* TITLE */}
          <div className="form-group">
            <label>
              Blog Title *
            </label>

            <input
              type="text"
              value={form.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          {/* SLUG */}
          <div className="form-group">
            <label>
              Slug *
            </label>

            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
            />
          </div>

          {/* CATEGORY */}
          <div className="form-group">
            <label>
              Category
            </label>

            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          {/* TAGS */}
          <div className="form-group">
            <label>
              Tags
            </label>

            <input
              type="text"
              name="tags"
              placeholder="Farming, Seeds"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          {/* AUTHOR */}
          <div className="form-group">
            <label>
              Author Name
            </label>

            <input
              type="text"
              name="author_name"
              value={form.author_name}
              onChange={handleChange}
            />
          </div>

          {/* READING TIME */}
          <div className="form-group">
            <label>
              Reading Time
            </label>

            <input
              type="text"
              name="reading_time"
              placeholder="5 min read"
              value={form.reading_time}
              onChange={handleChange}
            />
          </div>

          {/* STATUS */}
          <div className="form-group">
            <label>
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>
            </select>
          </div>

          {/* SORT ORDER */}
          <div className="form-group">
            <label>
              Sort Order
            </label>

            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={handleChange}
            />
          </div>

          {/* IMAGE */}
          <div className="form-group">
            <label>
              Change Blog Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {previewImage && (
              <div
                style={{
                  marginTop: "12px",
                }}
              >
                <img
                  src={previewImage}
                  alt="Blog"
                  className="blog-admin-thumbnail"
                  style={{
                    width: "160px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>

        </div>

        {/* EXCERPT */}
        <div className="form-group full-width">
          <label>
            Excerpt
          </label>

          <textarea
            name="excerpt"
            rows="4"
            value={form.excerpt}
            onChange={handleChange}
          />
        </div>

        {/* CONTENT */}
        <div className="form-group full-width">
          <label>
            Blog Content *
          </label>

          <textarea
            name="content"
            rows="12"
            value={form.content}
            onChange={handleChange}
            required
          />
        </div>

        {/* SEO */}
        <div className="blog-form-grid">

          <div className="form-group">
            <label>
              Meta Title
            </label>

            <input
              type="text"
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Meta Description
            </label>

            <textarea
              name="meta_description"
              rows="3"
              value={form.meta_description}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* OPTIONS */}
        <div className="blog-checkbox-row">

          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={
                Number(form.is_active) === 1
              }
              onChange={handleChange}
            />

            Active
          </label>

          <label>
            <input
              type="checkbox"
              name="featured"
              checked={
                Number(form.featured) === 1
              }
              onChange={handleChange}
            />

            Featured
          </label>

        </div>

        {/* ACTIONS */}
        <div className="blog-form-actions">

          <button
            type="button"
            className="preview-blog-btn"
            onClick={() =>
              setShowPreview(true)
            }
          >
            Preview
          </button>

          <button
            type="submit"
            className="save-blog-btn"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "Update Blog"}
          </button>

        </div>

      </form>

      {/* ======================================
          PREVIEW MODAL
      ====================================== */}
      {showPreview && (
        <div
          className="blog-preview-overlay"
          onClick={() =>
            setShowPreview(false)
          }
        >
          <div
            className="blog-preview-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}
            <div className="blog-preview-header">

              <div>
                <span className="blog-preview-label">
                  BLOG PREVIEW
                </span>

                <h2>
                  {form.title ||
                    "Untitled Blog"}
                </h2>
              </div>

              <button
                type="button"
                className="blog-preview-close"
                onClick={() =>
                  setShowPreview(false)
                }
              >
                ×
              </button>

            </div>

            {/* IMAGE */}
            {previewImage && (
              <div className="blog-preview-image-wrapper">
                <img
                  src={previewImage}
                  alt={
                    form.title ||
                    "Blog preview"
                  }
                  className="blog-preview-image"
                />
              </div>
            )}

            {/* META */}
            <div className="blog-preview-meta">

              {form.category && (
                <span>
                  {form.category}
                </span>
              )}

              {form.author_name && (
                <span>
                  By {form.author_name}
                </span>
              )}

              {form.reading_time && (
                <span>
                  {form.reading_time}
                </span>
              )}

              <span>
                {form.status}
              </span>

            </div>

            {/* EXCERPT */}
            {form.excerpt && (
              <div className="blog-preview-excerpt">
                {form.excerpt}
              </div>
            )}

            {/* CONTENT */}
            <div className="blog-preview-content">
              {form.content ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: form.content,
                  }}
                />
              ) : (
                <p>
                  No content added yet.
                </p>
              )}
            </div>

            {/* TAGS */}
            {form.tags && (
              <div className="blog-preview-tags">
                {form.tags
                  .split(",")
                  .map((tag, index) => (
                    <span key={index}>
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            )}

            {/* FOOTER */}
            <div className="blog-preview-footer">
              <button
                type="button"
                className="blog-preview-close-btn"
                onClick={() =>
                  setShowPreview(false)
                }
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
};

export default EditBlog;