import { Link } from "react-router-dom";
import { ASSET_BASE_URL } from "../../api.js";

const CategoriesFilter = ({
  categories = [],
  products = [],
}) => {
  const getImageUrl = (url) => {
    if (!url) return "";

    if (typeof url !== "string") {
      return "";
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${ASSET_BASE_URL}${
      url.startsWith("/") ? "" : "/"
    }${url}`;
  };

  return (
    <div className="sidebar-category-card">

      <h3>Categories</h3>

      <div className="listing-catList">

        {categories.map((cat) => {

          const categoryName =
            cat.name || "";

          const categoryImage =
            getImageUrl(cat.image);

          const productCount =
            products.filter((product) => {
              const productCategory =
                product.category_name ||
                product.category?.name ||
                "";

              return (
                productCategory
                  .toLowerCase()
                  .trim() ===
                categoryName
                  .toLowerCase()
                  .trim()
              );
            }).length;

          return (
            <div
              key={cat.id}
              className="listing-catItem"
            >

              {/* CATEGORY IMAGE */}

              <span className="catList-img">

                {categoryImage ? (
                  <img
                    src={categoryImage}
                    width={30}
                    height={30}
                    alt={categoryName}
                  />
                ) : (
                  <span className="catList-noImage">
                    —
                  </span>
                )}

              </span>

              {/* CATEGORY NAME */}

              <Link
                to={`/products-categories/${encodeURIComponent(
                  categoryName
                )}`}
              >
                <h4>
                  {categoryName}
                </h4>
              </Link>

              {/* PRODUCT COUNT */}

              <span className="catList-stock">
                {productCount}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default CategoriesFilter;