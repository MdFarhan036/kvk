import { useState } from "react";

const ProductDetails = ({ product, addToCart, addToWishlist }) => {
  const [inputValue, setInputValue] = useState(1);
  const [toggleState, setToggleState] = useState(1);

  const plus = () => setInputValue((prev) => prev + 1);
  const minus = () => setInputValue((prev) => (prev > 1 ? prev - 1 : 1));
  const handleInputChange = (e) => setInputValue(Math.max(parseInt(e.target.value) || 1, 1));

  return (
    <>
      <div className="product-details">
        <h1 className="product-title">{product.name}</h1>
        <div className="products-pricing">
          <span className="old-price">₹{product.discount_price}</span>
          {product.original_price && <span className="original">₹{product.original_price}</span>}
        </div>
        <p className="product-description">{product.description}</p>

        <div className="product-actions">
          <div className="product-quantity">
            <span className="qty-down" onClick={minus}><i className="fa-solid fa-chevron-down"></i></span>
            <input type="number" value={inputValue} onChange={handleInputChange} min="1" />
            <span className="qty-up" onClick={plus}><i className="fa-solid fa-chevron-up"></i></span>
          </div>
        </div>

        <div className="product-details-button">
          <button className="add-to-cart" onClick={() => addToCart({ ...product, quantity: inputValue })}>Add to Cart</button>
          <button className="buy-now">Buy Now</button>
          <button className="add-to-cart" onClick={() => addToWishlist(product)}>Wishlist Now</button>
        </div>

        {/* Tabs */}
        <div className="detailspage-descriptions-container">
          <ul className="detailspage-tab">
            {[1, 2, 3, 4].map((tab) => (
              <li
                key={tab}
                onClick={() => setToggleState(tab)}
                className={toggleState === tab ? "detailspage-tab-list active-detailspage-tab-list" : "detailspage-tab-list"}
              >
                {tab === 1 ? "Description" : tab === 2 ? "Additional info" : tab === 3 ? "Admin" : "Reviews"}
              </li>
            ))}
          </ul>
          <div className="detailspage-para">
            {toggleState === 1 && <div className="detailspage-para-content">{product.description}</div>}
            {toggleState === 2 && <div className="detailspage-para-content">{product.additional_info || "No extra info"}</div>}
            {toggleState === 3 && <div className="detailspage-para-content">Managed by: <b>Admin</b></div>}
            {toggleState === 4 && <div className="detailspage-para-content">Reviews coming soon...</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
