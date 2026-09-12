import "./Compare.css";
import { Link } from "react-router-dom";

const ROWS = [
  { label: "Price",        key: "price",         format: (v) => v ? `₹${v}` : "—" },
  { label: "Discount",     key: "discount_price", format: (v) => v ? `₹${v}` : "—" },
  { label: "Brand",        key: "brand",          format: (v) => v || "—" },
  { label: "Stock",        key: "stock",          format: (v) => v > 0 ? `In Stock (${v})` : "Out of Stock" },
  { label: "Category",     key: "category_name",  format: (v) => v || "—" },
  { label: "Description",  key: "pdescription",   format: (v) => v || "—" },
];

export const Compare = ({ selectedProducts, onRemove }) => {
  if (!selectedProducts || selectedProducts.length === 0) {
    return (
      <div className="compare-empty">
        <i className="fa-solid fa-scale-balanced"></i>
        <p>No products selected for comparison.</p>
        <span>Add products from any category to compare them here.</span>
      </div>
    );
  }

  const lowestPrice = Math.min(
    ...selectedProducts.map((p) => parseFloat(p.discount_price || p.price) || Infinity)
  );

  return (
    <div className="compare-wrapper">
      <div className="compare-header">
        <h2>Product Comparison</h2>
        <span className="compare-count">{selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""}</span>
      </div>

      <div className="compare-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-label-col"></th>
              {selectedProducts.map((product) => {
                const isBest =
                  parseFloat(product.discount_price || product.price) === lowestPrice;
                return (
                  <th key={product.id} className={`compare-product-col ${isBest ? "best-value" : ""}`}>
                    {isBest && (
                      <span className="best-badge">Best Value</span>
                    )}
                    <div className="compare-product-img-wrap">
                      {product.images?.[0] ? (
                        <img
                          src={`http://localhost:8000${product.images[0]}`}
                          alt={product.name}
                          className="compare-product-img"
                        />
                      ) : product.pimage ? (
                        <img
                          src={product.pimage}
                          alt={product.name}
                          className="compare-product-img"
                        />
                      ) : (
                        <div className="compare-no-img">No Image</div>
                      )}
                    </div>
                    <p className="compare-product-name">{product.name || product.title}</p>
                    {onRemove && (
                      <button
                        className="compare-remove-btn"
                        onClick={() => onRemove(product.id)}
                        title="Remove"
                      >
                        <i className="fa-solid fa-xmark"></i> Remove
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {ROWS.map(({ label, key, format }) => (
              <tr key={key}>
                <td className="compare-row-label">{label}</td>
                {selectedProducts.map((product) => {
                  const val = product[key];
                  const isOutOfStock = key === "stock" && !(val > 0);
                  return (
                    <td
                      key={product.id}
                      className={`compare-row-value ${isOutOfStock ? "out-of-stock" : ""}`}
                    >
                      {format(val)}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr className="compare-actions-row">
              <td className="compare-row-label"></td>
              {selectedProducts.map((product) => (
                <td key={product.id}>
                  <Link to="/cartpage">
                    <button className="compare-cart-btn">
                      <i className="fa-solid fa-cart-shopping"></i> Add to Cart
                    </button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};