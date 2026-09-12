import React, {
  useState,
  useEffect,
  useContext,
} from "react";
import api from "../api";
import { ProductContext } from "../../context/ProductContext.jsx";
import "./UploadProduct.css";

export const UploadProduct = () => {
  const { triggerRefresh } = useContext(ProductContext);

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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
    meta_title: "",
    meta_description: "",
    keywords: "",
    canonical_url: "",
    structured_data: "",
    files: [],
    previews: [],
  });

  const [tabs, setTabs] = useState([
    {
      title: "Overview",
      content: "",
    },
  ]);

  // =====================================================
  // SLUG
  // =====================================================

  const generateSlug = (text) =>
    text
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "";

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        if (isMounted) {
          setCategories(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error(
          "Error fetching categories:",
          err
        );

        if (isMounted) {
          setCategories([]);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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
  // IMAGE UPLOAD
  // =====================================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setProduct((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
      previews: [...prev.previews, ...previews],
    }));

    // Allow selecting the same file again
    e.target.value = "";
  };

  // =====================================================
  // DELETE UPLOADED IMAGE
  // =====================================================

  const deleteImage = (index) => {
    const previewUrl = product.previews[index];

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

    try {
      // -----------------------------------------------
      // CREATE FORM DATA
      // -----------------------------------------------

      const formData = new FormData();

      Object.keys(product).forEach((key) => {
        if (
          key !== "files" &&
          key !== "previews"
        ) {
          formData.append(
            key,
            product[key]
          );
        }
      });

      // -----------------------------------------------
      // SLUG
      // -----------------------------------------------

      formData.set(
        "slug",
        generateSlug(product.title)
      );

      // -----------------------------------------------
      // IMAGES
      // -----------------------------------------------

      product.files.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      // -----------------------------------------------
      // CREATE PRODUCT
      // -----------------------------------------------

      const { data } = await api.post(
        "/products",
        formData
      );

      const productId = data?.id;

      if (!productId) {
        throw new Error(
          "Product ID was not returned by the server."
        );
      }

      // -----------------------------------------------
      // SAVE PRODUCT TABS
      // -----------------------------------------------

      if (tabs.length > 0) {
        await api.post(
          `/products/${productId}/tabs`,
          {
            tabs,
          }
        );
      }

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      setModalMessage(
        "Product created successfully"
      );

      setShowModal(true);

      // -----------------------------------------------
      // RESET PRODUCT
      // -----------------------------------------------

      setProduct({
        title: "",
        brand: "",
        description: "",
        subdescription: "",
        category_id: "",
        oldPrice: "",
        price: "",
        stock: "",
        status: "draft",
        meta_title: "",
        meta_description: "",
        keywords: "",
        canonical_url: "",
        structured_data: "",
        files: [],
        previews: [],
      });

      // -----------------------------------------------
      // RESET TABS
      // -----------------------------------------------

      setTabs([
        {
          title: "Overview",
          content: "",
        },
      ]);

      // -----------------------------------------------
      // REFRESH PRODUCT LIST
      // -----------------------------------------------

      triggerRefresh();

    } catch (err) {
      console.error(
        "Failed to create product:",
        err.response?.data ||
          err.message ||
          err
      );

      setModalMessage(
        err.response?.data?.message ||
          "Failed to create product"
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

    return () => {
      clearTimeout(timer);
    };
  }, [showModal]);

  // =====================================================
  // CLEANUP IMAGE PREVIEWS
  // =====================================================

  useEffect(() => {
    return () => {
      product.previews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="ep-wrapper">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="ep-header">

        <h2>Create Product</h2>

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

          {/* TITLE */}

          <input
            className="ep-input"
            name="title"
            value={product.title}
            onChange={handleChange}
            placeholder="Title"
          />

          {/* BRAND */}

          <input
            className="ep-input"
            name="brand"
            value={product.brand}
            onChange={handleChange}
            placeholder="Brand"
          />

          {/* SHORT DESCRIPTION */}

          <textarea
            className="ep-textarea"
            name="subdescription"
            value={
              product.subdescription
            }
            onChange={handleChange}
            placeholder="Short Description"
          />

          {/* HTML DESCRIPTION */}

          <textarea
            className="ep-textarea"
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="<h2>HTML Description</h2>"
          />

          {/* HTML PREVIEW */}

          <div className="ep-html-preview">

            <div
              dangerouslySetInnerHTML={{
                __html:
                  product.description ||
                  "<p>No preview</p>",
              }}
            />

          </div>

          {/* CATEGORY */}

          <select
            className="ep-select"
            name="category_id"
            value={product.category_id}
            onChange={handleChange}
          >

            <option value="">
              Select Category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}

          </select>

          {/* SLUG */}

          <p className="ep-slug">
            URL: /product/
            {generateSlug(
              product.title
            )}
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
            onChange={
              handleImageChange
            }
          />

          <div className="ep-img-grid">

            {product.previews.map(
              (img, i) => (
                <div
                  key={i}
                  className="ep-img-box"
                >

                  <img
                    src={img}
                    alt={`Product preview ${
                      i + 1
                    }`}
                  />

                  <button
                    type="button"
                    className="ep-image-delete"
                    onClick={() =>
                      deleteImage(i)
                    }
                  >
                    Delete
                  </button>

                </div>
              )
            )}

          </div>

        </section>

        {/* =================================================
            PRICING
        ================================================= */}

        <section className="ep-card">

          <h3>Pricing</h3>

          <input
            className="ep-input"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="Price"
            type="number"
            min="0"
            step="0.01"
          />

          <input
            className="ep-input"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            placeholder="Stock"
            type="number"
            min="0"
          />

        </section>

        {/* =================================================
            SEO
        ================================================= */}

        <section className="ep-card">

          <h3>SEO</h3>

          <input
            className="ep-input"
            name="meta_title"
            value={product.meta_title}
            onChange={handleChange}
            placeholder="Meta Title"
          />

          <textarea
            className="ep-textarea"
            name="meta_description"
            value={
              product.meta_description
            }
            onChange={handleChange}
            placeholder="Meta Description"
          />

          <input
            className="ep-input"
            name="keywords"
            value={product.keywords}
            onChange={handleChange}
            placeholder="Keywords"
          />

        </section>

        {/* =================================================
            PRODUCT TABS
        ================================================= */}

        <section className="ep-card">

          <h3>Product Tabs</h3>

          {tabs.map(
            (tab, i) => (
              <div
                key={i}
                className="ep-tab-box"
              >

                <input
                  className="ep-input"
                  placeholder="Tab Title"
                  value={tab.title}
                  onChange={(e) =>
                    updateTab(
                      i,
                      "title",
                      e.target.value
                    )
                  }
                />

                <textarea
                  className="ep-textarea"
                  placeholder="<h2>HTML Content</h2>"
                  value={tab.content}
                  onChange={(e) =>
                    updateTab(
                      i,
                      "content",
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    deleteTab(i)
                  }
                >
                  Delete
                </button>

              </div>
            )
          )}

          <button
            type="button"
            onClick={addTab}
          >
            + Add Tab
          </button>

        </section>

        {/* =================================================
            CREATE PRODUCT
        ================================================= */}

        <button
          type="submit"
          className="ep-btn ep-btn-primary"
        >
          Create Product
        </button>

      </form>

      {/* =================================================
          SUCCESS / ERROR MODAL
      ================================================= */}

      {showModal && (
        <div className="ep-modal-overlay">

          <div className="ep-modal">

            <p>
              {modalMessage}
            </p>

          </div>

        </div>
      )}

    </main>
  );
};