import React, { useState, useContext, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api";

import { ProductContext } from "../../context/ProductContext.jsx";
import "./UploadProduct.css";

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh } = useContext(ProductContext);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const [tabs, setTabs] = useState([
    {
      title: "",
      content: "",
    },
  ]);

  const [product, setProduct] = useState({
    title: "",
    brand: "",
    description: "",
    subdescription: "",
    category_id: "",
    oldPrice: "",
    price: "",
    stock: "",
    status: "draft",
    files: [],
    previews: [],
    existingImages: [],
    size: "",
    weight: "",
    type: "",
    mfg: "",
    tags: "",
    life: "",
    keywords: "",
    slug: "",
    meta_title: "",
    meta_description: "",
  });

  const [categories, setCategories] = useState([]);

  // =====================================================
  // SLUG
  // =====================================================

  const generateSlug = (text) =>
    text
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error(
          "Error fetching categories:",
          err
        );
      }
    };

    fetchCategories();
  }, []);

  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(
          `/products/${id}`
        );

        const data = res.data;

        setProduct((prev) => ({
          ...prev,

          title: data.title || "",
          brand: data.brand || "",
          description: data.description || "",
          subdescription:
            data.subdescription || "",

          category_id:
            data.category_id || "",

          oldPrice:
            data.oldPrice || "",

          price:
            data.price || "",

          stock:
            data.stock || "",

          status:
            data.status || "draft",

          existingImages:
            data.images || [],

          size:
            data.size || "",

          weight:
            data.weight || "",

          type:
            data.type || "",

          mfg:
            data.mfg || "",

          tags:
            data.tags || "",

          life:
            data.life || "",

          slug:
            data.slug ||
            generateSlug(data.title),

          meta_title:
            data.meta_title || "",

          meta_description:
            data.meta_description || "",

          keywords:
            data.keywords || "",
        }));

        setShowPreview(true);
        setLoading(false);
      } catch (err) {
        console.error(
          "Error fetching product:",
          err
        );

        setModalMessage(
          "Failed to load product"
        );

        setShowModal(true);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // NEW IMAGE UPLOAD
  // =====================================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setProduct((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
      previews: [
        ...prev.previews,
        ...previews,
      ],
    }));

    setShowPreview(true);

    // Allow selecting same file again
    e.target.value = "";
  };

  // =====================================================
  // DELETE NEW IMAGE PREVIEW
  // =====================================================

  const handleDeletePreview = (index) => {
    const previewUrl =
      product.previews[index];

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setProduct((prev) => ({
      ...prev,

      files: prev.files.filter(
        (_, i) => i !== index
      ),

      previews: prev.previews.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // =====================================================
  // DELETE EXISTING IMAGE
  // =====================================================

  const handleDeleteExisting = async (
    imgUrl
  ) => {
    try {
      await api.delete(
        `/products/${id}/image`,
        {
          data: {
            imageUrl: imgUrl,
          },
        }
      );

      setProduct((prev) => ({
        ...prev,

        existingImages:
          prev.existingImages.filter(
            (img) => img !== imgUrl
          ),
      }));
    } catch (err) {
      console.error(
        "Error deleting existing image:",
        err
      );

      setModalMessage(
        "Failed to delete image"
      );

      setShowModal(true);
    }
  };

  // =====================================================
  // TAB HANDLERS
  // =====================================================

  const addTab = () => {
    setTabs((prev) => [
      ...prev,
      {
        title: "",
        content: "",
      },
    ]);
  };

  const updateTab = (
    index,
    field,
    value
  ) => {
    setTabs((prev) =>
      prev.map((tab, i) =>
        i === index
          ? {
              ...tab,
              [field]: value,
            }
          : tab
      )
    );
  };

  const deleteTab = (index) => {
    setTabs((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !product.title ||
      !product.price ||
      !product.category_id
    ) {
      setModalMessage(
        "Please fill required fields"
      );

      setShowModal(true);
      return;
    }

    if (
      isNaN(product.price) ||
      isNaN(product.stock)
    ) {
      setModalMessage(
        "Price and Stock must be numbers"
      );

      setShowModal(true);
      return;
    }

    try {
      const formData = new FormData();

      const slug = generateSlug(
        product.title
      );

      Object.keys(product).forEach((key) => {
        if (
          key !== "files" &&
          key !== "previews" &&
          key !== "existingImages"
        ) {
          formData.append(
            key,
            product[key]
          );
        }
      });

      formData.set("slug", slug);

      // =================================================
      // NEW IMAGES ONLY
      // =================================================

      product.files.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      // =================================================
      // UPDATE PRODUCT
      // =================================================

      await api.put(
        `/products/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      // =================================================
      // SAVE TABS
      // =================================================

      await api.post(
        `/products/${id}/tabs`,
        {
          tabs,
        }
      );

      setModalMessage(
        "Product updated successfully"
      );

      setShowModal(true);

      triggerRefresh();

      setTimeout(() => {
        navigate(
          "/allproducts/productTable"
        );
      }, 1500);

    } catch (err) {
      console.error(
        "Update product failed:",
        err
      );

      setModalMessage(
        "Update failed"
      );

      setShowModal(true);
    }
  };

  // =====================================================
  // MODAL AUTO CLOSE
  // =====================================================

  useEffect(() => {
    if (!showModal) return;

    const timer = setTimeout(() => {
      setShowModal(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showModal]);

  // =====================================================
  // FETCH TABS
  // =====================================================

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const res = await api.get(
          `/products/${id}/tabs`
        );

        if (
          Array.isArray(res.data) &&
          res.data.length
        ) {
          setTabs(res.data);
        }
      } catch (err) {
        console.error(
          "Error fetching tabs:",
          err
        );
      }
    };

    fetchTabs();
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <h2 style={{ padding: "40px" }}>
        Loading product...
      </h2>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="ep-wrapper">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="ep-header">
        <h2>Edit Product</h2>

        <button
          type="button"
          className="ep-btn ep-btn-primary"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="ep-form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <section className="ep-card">
          <h3>Basic Information</h3>

          <input
            className="ep-input"
            name="title"
            value={product.title}
            onChange={handleChange}
            placeholder="Title"
          />

          <input
            className="ep-input"
            name="brand"
            value={product.brand}
            onChange={handleChange}
            placeholder="Brand"
          />

          <textarea
            className="ep-textarea"
            name="subdescription"
            value={
              product.subdescription
            }
            onChange={handleChange}
            placeholder="Sub Description"
          />

          <div className="ep-field">
            <label>
              Description (HTML Allowed)
            </label>

            <textarea
              className="ep-textarea"
              name="description"
              value={
                product.description || ""
              }
              onChange={handleChange}
              placeholder="<h2>Title</h2><p>Description here...</p>"
              rows={8}
            />
          </div>

          <div className="ep-preview">
            <label>Preview</label>

            <div
              className="ep-html-preview"
              dangerouslySetInnerHTML={{
                __html:
                  product.description ||
                  "<p>No preview</p>",
              }}
            />
          </div>

          <select
            className="ep-select"
            name="category_id"
            value={product.category_id}
            onChange={handleChange}
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <p className="ep-slug">
            URL: /product/
            {generateSlug(product.title)}
          </p>
        </section>

        {/* =================================================
            IMAGES
        ================================================= */}

        <section className="ep-card">
          <h3>Images</h3>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          <div className="ep-img-grid">

            {/* EXISTING IMAGES */}

            {product.existingImages.map(
              (img, i) => (
                <div
                  key={`existing-${i}`}
                  className="ep-img-box"
                >
                  <img
                    src={`${ASSET_BASE_URL}${img}`}
                    alt={`Existing product ${
                      i + 1
                    }`}
                  />

                  <MdDelete
                    className="ep-delete"
                    title="Delete image"
                    onClick={() =>
                      handleDeleteExisting(
                        img
                      )
                    }
                  />
                </div>
              )
            )}

            {/* NEW IMAGES */}

            {product.previews.map(
              (img, i) => (
                <div
                  key={`new-${i}`}
                  className="ep-img-box"
                >
                  <img
                    src={img}
                    alt={`New product ${
                      i + 1
                    }`}
                  />

                  <MdDelete
                    className="ep-delete"
                    title="Remove image"
                    onClick={() =>
                      handleDeletePreview(
                        i
                      )
                    }
                  />
                </div>
              )
            )}

          </div>
        </section>

        {/* =================================================
            PRICING & STOCK
        ================================================= */}

        <section className="ep-card">
          <h3>Pricing & Stock</h3>

          <div className="ep-grid-2">

            <input
              className="ep-input"
              name="price"
              value={product.price}
              onChange={handleChange}
              placeholder="Price"
            />

            <input
              className="ep-input"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              placeholder="Stock"
            />

          </div>
        </section>

        {/* =================================================
            SEO
        ================================================= */}

        <section className="ep-card">
          <h3>SEO Settings</h3>

          <input
            className="ep-input"
            name="meta_title"
            value={
              product.meta_title || ""
            }
            onChange={handleChange}
            placeholder="Meta Title"
          />

          <textarea
            className="ep-textarea"
            name="meta_description"
            value={
              product.meta_description ||
              ""
            }
            onChange={handleChange}
            placeholder="Meta Description"
          />

          <input
            className="ep-input"
            name="keywords"
            value={
              product.keywords || ""
            }
            onChange={handleChange}
            placeholder="Keywords"
          />
        </section>

        {/* =================================================
            ADVANCED
        ================================================= */}

        <section className="ep-card">
          <h3>Advanced</h3>

          <div className="ep-grid-3">

            <input
              className="ep-input"
              name="size"
              value={product.size}
              onChange={handleChange}
              placeholder="Size"
            />

            <input
              className="ep-input"
              name="weight"
              value={product.weight}
              onChange={handleChange}
              placeholder="Weight"
            />

            <input
              className="ep-input"
              name="type"
              value={product.type}
              onChange={handleChange}
              placeholder="Type"
            />

            <input
              className="ep-input"
              name="mfg"
              value={product.mfg}
              onChange={handleChange}
              placeholder="MFG"
            />

            <input
              className="ep-input"
              name="tags"
              value={product.tags}
              onChange={handleChange}
              placeholder="Tags"
            />

            <input
              className="ep-input"
              name="life"
              value={product.life}
              onChange={handleChange}
              placeholder="Life"
            />

          </div>
        </section>

        {/* =================================================
            PRODUCT TABS
        ================================================= */}

        <section className="ep-card">
          <h3>Product Tabs</h3>

          {tabs.map((tab, index) => (
            <div
              key={index}
              className="ep-tab-box"
            >

              <input
                className="ep-input"
                placeholder="Tab Title (e.g. Overview)"
                value={tab.title}
                onChange={(e) =>
                  updateTab(
                    index,
                    "title",
                    e.target.value
                  )
                }
              />

              <textarea
                className="ep-textarea"
                placeholder="<h2>HTML Content...</h2>"
                value={tab.content}
                onChange={(e) =>
                  updateTab(
                    index,
                    "content",
                    e.target.value
                  )
                }
                rows={4}
              />

              <button
                type="button"
                className="ep-btn"
                onClick={() =>
                  deleteTab(index)
                }
              >
                Delete Tab
              </button>

            </div>
          ))}

          <button
            type="button"
            className="ep-btn ep-btn-primary"
            onClick={addTab}
          >
            + Add Tab
          </button>
        </section>

        {/* =================================================
            UPDATE
        ================================================= */}

        <button
          type="submit"
          className="ep-btn ep-btn-primary"
        >
          Update Product
        </button>

      </form>

      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (
        <div className="ep-modal-overlay">
          <div className="ep-modal">
            <p>{modalMessage}</p>
          </div>
        </div>
      )}

    </main>
  );
};