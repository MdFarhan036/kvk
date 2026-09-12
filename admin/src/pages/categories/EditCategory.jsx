import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api";
import "./AllCategories.css";

export const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    meta_title: "",
    meta_description: "",
    keywords: "",
    canonical_url: "",
    structured_data: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // ================= FETCH =================
  const fetchCategory = async () => {
    try {
      const res = await api.get(`/categories/${id}`);

      setForm({
        name: res.data.name || "",
        slug: res.data.slug || "",
        meta_title: res.data.meta_title || "",
        meta_description: res.data.meta_description || "",
        keywords: res.data.keywords || "",
        canonical_url: res.data.canonical_url || "",
        structured_data: res.data.structured_data || "",
      });

      if (res.data.image) {
        setPreview(`${ASSET_BASE_URL}${res.data.image}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load category");
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  // ================= SLUG =================
  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  useEffect(() => {
    if (!form.slug) {
      setForm((prev) => ({
        ...prev,
        slug: generateSlug(prev.name),
      }));
    }
  }, [form.name]);

  // ================= IMAGE =================
  const handleImage = (file) => {
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage("❌ Name is required");
      return;
    }

    // Validate JSON
    if (form.structured_data) {
      try {
        JSON.parse(form.structured_data);
      } catch {
        setMessage("❌ Invalid JSON in structured data");
        return;
      }
    }

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (image) {
      formData.append("image", image);
    }

    try {
      await api.put(`/categories/${id}`, formData);

      setMessage("✅ Updated successfully");

      setTimeout(() => {
        navigate("/categories/categoryTable");
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Update failed");
    }
  };

  return (
    <div className="cms-layout">

      {/* ================= MAIN ================= */}
      <main className="cms-content">

        <h1>Edit Category</h1>

        {message && <p>{message}</p>}

        {/* ================= TABS ================= */}
        <div className="cms-tabs">
          {["basic", "seo", "advanced"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "active" : ""}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ================= BASIC ================= */}
          {activeTab === "basic" && (
            <section>
              <h3>Basic Info</h3>

              <div className="cms-field">
                <label>Name</label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="cms-field">
                <label>Slug</label>

                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                    })
                  }
                />
              </div>

              <div className="cms-field">
                <label>Image</label>

                <input
                  type="file"
                  onChange={(e) =>
                    handleImage(e.target.files[0])
                  }
                />

                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      marginTop: 10,
                      width: 120,
                    }}
                  />
                )}
              </div>
            </section>
          )}

          {/* ================= SEO ================= */}
          {activeTab === "seo" && (
            <section>
              <h3>SEO Settings</h3>

              <div className="cms-field">
                <label>Meta Title</label>

                <input
                  value={form.meta_title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meta_title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="cms-field">
                <label>Meta Description</label>

                <textarea
                  value={form.meta_description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meta_description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="cms-field">
                <label>Keywords</label>

                <textarea
                  value={form.keywords}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      keywords: e.target.value,
                    })
                  }
                />
              </div>

              {/* SEO PREVIEW */}
              <div className="seo-preview">
                <p>
                  {form.meta_title ||
                    form.name ||
                    "Page Title"}
                </p>

                <p>
                  /{form.slug}
                </p>

                <p>
                  {form.meta_description ||
                    "Your description will appear here..."}
                </p>
              </div>
            </section>
          )}

          {/* ================= ADVANCED ================= */}
          {activeTab === "advanced" && (
            <section>
              <h3>Advanced</h3>

              <div className="cms-field">
                <label>Canonical URL</label>

                <input
                  value={form.canonical_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      canonical_url: e.target.value,
                    })
                  }
                />
              </div>

              <div className="cms-field">
                <label>
                  Structured Data (JSON)
                </label>

                <textarea
                  value={form.structured_data}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      structured_data: e.target.value,
                    })
                  }
                />
              </div>
            </section>
          )}

          {/* ================= SUBMIT ================= */}
          <button type="submit">
            Update Category
          </button>

        </form>
      </main>

    </div>
  );
};