import { useEffect, useState } from "react";
import "./BlogAdmin.css";
import api from "./api"; // axios wrapper

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

const BlogAdmin = () => {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ============================================
     FETCH BLOGS
  ============================================ */

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/admin/blogs");

      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      alert("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  /* ============================================
     HANDLE INPUT
  ============================================ */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  /* ============================================
     AUTO GENERATE SLUG
  ============================================ */

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

  /* ============================================
     SUBMIT
  ============================================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      if (editingId) {
        await api.put(
          `/admin/blogs/${editingId}`,
          formData
        );

        alert("Blog updated successfully");
      } else {
        await api.post(
          "/admin/blogs",
          formData
        );

        alert("Blog created successfully");
      }

      setForm(initialForm);
      setSelectedImage(null);
      setEditingId(null);

      await fetchBlogs();
    } catch (error) {
      console.error("Blog save error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to save blog"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================
     EDIT BLOG
  ============================================ */

  const handleEdit = (blog) => {
    setEditingId(blog.id);

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
      meta_description: blog.meta_description || "",
      sort_order: blog.sort_order ?? 1,
      is_active: Number(blog.is_active ?? 1),
      featured: Number(blog.featured ?? 0),
      status: blog.status || "draft",
      published_at: blog.published_at
        ? blog.published_at.slice(0, 16)
        : "",
    });

    setSelectedImage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ============================================
     DELETE BLOG
  ============================================ */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/blogs/${id}`);

      alert("Blog deleted successfully");

      await fetchBlogs();
    } catch (error) {
      console.error("Delete error:", error);

      alert("Failed to delete blog");
    }
  };

  /* ============================================
     CANCEL EDIT
  ============================================ */

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setSelectedImage(null);
  };

  return (
    <main className="user-details-page">

      {/* ============================================
          HEADER
      ============================================ */}

  <div className="adminproduct-head">
        <div>
          <h1>
            {editingId ? "Edit Blog" : "Blog Management"}
          </h1>

          <p>
            Create, edit and manage your website blogs.
          </p>
        </div>
      </div>

      {/* ============================================
          BLOG FORM
      ============================================ */}

      <form
        className="blog-admin-form"
        onSubmit={handleSubmit}
      >

        <div className="blog-form-grid">

          <div className="form-group">
            <label>Blog Title</label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Slug</label>

            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>

            <input
              type="text"
              name="tags"
              placeholder="Agriculture, Farming, Seeds"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Author Name</label>

            <input
              type="text"
              name="author_name"
              value={form.author_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Reading Time</label>

            <input
              type="text"
              name="reading_time"
              placeholder="5 min read"
              value={form.reading_time}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Status</label>

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

          <div className="form-group">
            <label>Sort Order</label>

            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Published Date</label>

            <input
              type="datetime-local"
              name="published_at"
              value={form.published_at}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Blog Image</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setSelectedImage(e.target.files?.[0] || null)
              }
            />
          </div>

        </div>

        {/* EXCERPT */}

        <div className="form-group full-width">
          <label>Excerpt</label>

          <textarea
            name="excerpt"
            rows="4"
            value={form.excerpt}
            onChange={handleChange}
          />
        </div>

        {/* CONTENT */}

        <div className="form-group full-width">
          <label>Blog Content</label>

          <textarea
            name="content"
            rows="10"
            value={form.content}
            onChange={handleChange}
            required
          />
        </div>

        {/* SEO */}

        <div className="blog-form-grid">

          <div className="form-group">
            <label>Meta Title</label>

            <input
              type="text"
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Meta Description</label>

            <textarea
              name="meta_description"
              rows="3"
              value={form.meta_description}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* CHECKBOXES */}

        <div className="blog-checkbox-row">

          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={Number(form.is_active) === 1}
              onChange={handleChange}
            />

            Active
          </label>

          <label>
            <input
              type="checkbox"
              name="featured"
              checked={Number(form.featured) === 1}
              onChange={handleChange}
            />

            Featured Blog
          </label>

        </div>

        {/* BUTTONS */}

        <div className="blog-form-actions">

          <button
            type="submit"
            disabled={loading}
            className="save-blog-btn"
          >
            {loading
              ? "Saving..."
              : editingId
                ? "Update Blog"
                : "Create Blog"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-blog-btn"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}

        </div>

      </form>

      {/* ============================================
          BLOG LIST
      ============================================ */}

      <div className="blog-list-section">

        <h2>All Blogs</h2>

        {loading && blogs.length === 0 ? (
          <p>Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (

          <div className="blog-admin-table-wrapper">

            <table className="blog-admin-table">

              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {blogs.map((blog) => (

                  <tr key={blog.id}>

                    <td>
                      {blog.image_url ? (
                        <img
                          src={`http://localhost:8000${blog.image_url}`}
                          alt={blog.title}
                          className="blog-admin-thumbnail"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>

                    <td>
                      {blog.title}
                    </td>

                    <td>
                      {blog.category || "-"}
                    </td>

                    <td>
                      <span
                        className={`blog-status ${blog.status}`}
                      >
                        {blog.status}
                      </span>
                    </td>

                    <td>
                      {Number(blog.is_active) === 1
                        ? "Yes"
                        : "No"}
                    </td>

                    <td>
                      {Number(blog.featured) === 1
                        ? "Yes"
                        : "No"}
                    </td>

                    <td className="blog-actions">

                      <button
                        type="button"
                        className="edit-blog-btn"
                        onClick={() =>
                          handleEdit(blog)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-blog-btn"
                        onClick={() =>
                          handleDelete(blog.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </main>

  );
};

export default BlogAdmin;