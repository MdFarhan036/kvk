import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { ASSET_BASE_URL } from "./api";

import "./BlogAdmin.css";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ============================================
  // FETCH BLOGS
  // ============================================
  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/admin/blogs");

      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching blogs:", error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ============================================
  // DELETE BLOG
  // ============================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/blogs/${id}`);

      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog.id !== id)
      );

      alert("Blog deleted successfully!");
    } catch (error) {
      console.error("❌ Delete error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete blog"
      );
    }
  };

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
  // RENDER
  // ============================================
  return (
    <main className="category-table">

      {/* HEADER */}
      <div className="adminproduct-head">
        <div>
          <h1>All Blogs</h1>
          <p>Manage all your blog posts.</p>
        </div>

        <Link
          to="/blogs/create"
          className="create-blog-btn"
        >
          + Create Blog
        </Link>
      </div>

      {/* TABLE */}
      <div className="blog-admin-table-wrapper">

        {loading ? (
          <div className="blog-loading">
            Loading blogs...
          </div>
        ) : blogs.length === 0 ? (
          <div className="blog-empty">
            <p>No blogs found.</p>

            <Link
              to="/admin/blogs/create"
              className="create-blog-btn"
            >
              Create First Blog
            </Link>
          </div>
        ) : (
          <table className="blog-admin-table">

            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Active</th>
                <th>Featured</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {blogs.map((blog) => {
                const imageUrl = getImageUrl(
                  blog.image_url
                );

                return (
                  <tr key={blog.id}>

                    {/* IMAGE */}
                    <td>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={
                            blog.title || "Blog"
                          }
                          className="blog-admin-thumbnail"
                        />
                      ) : (
                        <div className="blog-no-image">
                          No Image
                        </div>
                      )}
                    </td>

                    {/* TITLE */}
                    <td className="blog-title-cell">
                      <strong>
                        {blog.title}
                      </strong>

                      <small>
                        /{blog.slug}
                      </small>
                    </td>

                    {/* CATEGORY */}
                    <td>
                      {blog.category || "-"}
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`blog-status ${
                          blog.status || "draft"
                        }`}
                      >
                        {blog.status || "draft"}
                      </span>
                    </td>

                    {/* ACTIVE */}
                    <td>
                      <span
                        className={
                          Number(blog.is_active) === 1
                            ? "boolean-yes"
                            : "boolean-no"
                        }
                      >
                        {Number(blog.is_active) === 1
                          ? "Yes"
                          : "No"}
                      </span>
                    </td>

                    {/* FEATURED */}
                    <td>
                      <span
                        className={
                          Number(blog.featured) === 1
                            ? "boolean-yes"
                            : "boolean-no"
                        }
                      >
                        {Number(blog.featured) === 1
                          ? "Yes"
                          : "No"}
                      </span>
                    </td>

                    {/* CREATED */}
                    <td>
                      {blog.created_at
                        ? new Date(
                            blog.created_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="blog-actions">

                        <button
                          type="button"
                          className="edit-blog-btn"
                          onClick={() =>
                            navigate(
                              `/blogs/edit/${blog.id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-blog-btn"
                          onClick={() =>
                            handleDelete(
                              blog.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        )}

      </div>
    </main>
  );
};

export default BlogList;