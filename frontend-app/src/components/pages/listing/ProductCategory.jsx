import { useEffect, useState } from "react";
import "./ProductCategory.css";
import { Link } from "react-router-dom";
import { Reveal } from "../../Reveal";
import api, { ASSET_BASE_URL } from "../../api.js";

export const ProductCategory = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        const formattedCategories = (
          Array.isArray(data) ? data : []
        ).map((cat) => ({
          ...cat,
          image: cat.image
            ? /^https?:\/\//i.test(cat.image)
              ? cat.image
              : `${ASSET_BASE_URL}${
                  cat.image.startsWith("/") ? "" : "/"
                }${cat.image}`
            : "",
        }));

        setCategories(formattedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="category-section">
      <Reveal className="categories-title">
        <span className="categories-eyebrow">
          Fresh &amp; Local
        </span>

        <h2>Shop by Category</h2>

        <div className="line-mf"></div>
      </Reveal>

      <div className="categories-wrapper">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Link
              to={`/products-categories/${encodeURIComponent(cat.name)}`}
              className="products-category-card"
              key={cat.id}
            >
              <div className="category-image">
                <span className="category-ring"></span>

                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="category-placeholder">
                    No Image
                  </div>
                )}
              </div>

              <span className="category-seed"></span>

              <p className="category-name">
                {cat.name}
              </p>
            </Link>
          ))
        ) : (
          <p className="no-categories">
            No categories available
          </p>
        )}
      </div>
    </section>
  );
};