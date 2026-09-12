import { Link } from "react-router-dom";

const Sidebar = ({ categories = [], relatedProducts = [] }) => (
  <div className="listing-wrapper">

    {/* =========================================
        CATEGORIES
    ========================================= */}

    <div className="sidebar-category-card">
      <h3>Categories</h3>

      <div className="listing-catList">
        {categories.map((cat) => {
          const categoryName = cat?.name || "";

          return (
            <div
              key={cat.id}
              className="listing-catItem"
            >
              <h4>{categoryName}</h4>

              <span className="catList-stock">
                {cat.product_count || 0}
              </span>

              <div className="listing-products">
                {Array.isArray(cat.products) &&
                  cat.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="listing-productItem"
                    >
                      <Link
                        to={
                          categoryName
                            ? `/products-categories/${encodeURIComponent(
                                categoryName
                              )}/${prod.id}`
                            : `/product/${prod.id}`
                        }
                        className="product-link"
                      >
                        {prod.name ||
                          prod.title ||
                          "Product"}
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* =========================================
        RELATED PRODUCTS
    ========================================= */}

    <div className="sidebar-category-card related-products-sidebar">
      <h3>Related Products</h3>

      <div className="listing-products">
        {Array.isArray(relatedProducts) &&
        relatedProducts.length > 0 ? (
          relatedProducts.map((product) => {
            const productCategory =
              product?.category_name ||
              product?.category?.name ||
              "";

            return (
              <div
                key={product.id}
                className="listing-productItem"
              >
                <Link
                  to={
                    productCategory
                      ? `/products-categories/${encodeURIComponent(
                          productCategory
                        )}/${product.id}`
                      : `/product/${product.id}`
                  }
                  className="product-link"
                >
                  {product.name ||
                    product.title ||
                    "Product"}
                </Link>
              </div>
            );
          })
        ) : (
          <p className="no-related-products">
            No related products available
          </p>
        )}
      </div>
    </div>

  </div>
);

export default Sidebar;