import { useState } from "react";
import api from "./api";

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

const CreateBlog = () => {
  const [form, setForm] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ============================================
  // HANDLE FORM CHANGE
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
  // CREATE BLOG
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          formData.append(
            key,
            value ?? ""
          );
        }
      );

      // Backend expects uploadBlog.single("image")
      if (selectedImage) {
        formData.append(
          "image",
          selectedImage
        );
      }

      await api.post(
        "/admin/blogs",
        formData
      );

      alert(
        "Blog created successfully!"
      );

      setForm(initialForm);
      setSelectedImage(null);
      setShowPreview(false);

    } catch (error) {
      console.error(
        "❌ Create blog error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create blog"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // IMAGE PREVIEW URL
  // ============================================
  const previewImageUrl = selectedImage
    ? URL.createObjectURL(selectedImage)
    : null;

  // ============================================
  // RENDER
  // ============================================
  return (
    <main className="blog-admin-page">

      {/* ======================================
          HEADER
      ====================================== */}
      <div className="blog-admin-header">
        <div>
          <h1>Create Blog</h1>

          <p>
            Create a new blog post.
          </p>
        </div>
      </div>

      {/* ======================================
          FORM
      ====================================== */}
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

          {/* BLOG IMAGE */}
          <div className="form-group">
            <label>
              Blog Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setSelectedImage(
                  e.target.files?.[0] ||
                    null
                )
              }
            />
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

          {/* META TITLE */}
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

          {/* META DESCRIPTION */}
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
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Blog"}
          </button>

        </div>

      </form>

      {/* ======================================
          BLOG PREVIEW MODAL
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

            {/* PREVIEW HEADER */}
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

            {/* FEATURE IMAGE */}
            {previewImageUrl && (
              <div className="blog-preview-image-wrapper">
                <img
                  src={previewImageUrl}
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

export default CreateBlog;