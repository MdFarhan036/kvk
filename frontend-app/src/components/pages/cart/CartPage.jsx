// src/pages/user/CartPage.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./cart.css";

import { useCart } from "../../../context/CartContext";
import { ASSET_BASE_URL } from "../../api.js";

export const CartPage = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    fetchCart,
    removeFromCart,
    clearCart,
  } = useCart();

  /* =========================================================
     FETCH CART
  ========================================================= */

  useEffect(() => {
    fetchCart();
  }, []);

  /* =========================================================
     TOTAL COST
  ========================================================= */

  const totalCost = cartItems.reduce(
    (acc, item) =>
      acc +
      Number(item.price) * Number(item.quantity),
    0
  );

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (!cartItems.length) {
    return <p>Your cart is empty.</p>;
  }

  /* =========================================================
     IMAGE URL HELPER
  ========================================================= */

  const getImageUrl = (item) => {
    const image =
      item.images && item.images.length > 0
        ? item.images[0]
        : item.image;

    if (!image) {
      return null;
    }

    // Already a complete URL
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    // Relative image path
    return `${ASSET_BASE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="cart-container">

      {/* =====================================================
          CART ITEMS
      ===================================================== */}

      <div className="cart-left">

        <h1>
          Your Cart ({cartItems.length})
        </h1>

        <button
          onClick={clearCart}
          className="cartremove-btn"
        >
          Clear Cart
        </button>

        <table className="table table-wishlist">

          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {cartItems.map((item) => {
              const imageUrl =
                getImageUrl(item);

              const itemPrice =
                Number(item.price) || 0;

              const quantity =
                Number(item.quantity) || 0;

              const subtotal =
                itemPrice * quantity;

              return (
                <tr
                  key={item.productId}
                >
                  {/* PRODUCT */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div className="img-box">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              item.title ||
                              item.name ||
                              "Product"
                            }
                          />
                        ) : (
                          <span>
                            No Image
                          </span>
                        )}

                      </div>

                      <span>
                        {item.title ||
                          item.name}
                      </span>
                    </div>
                  </td>

                  {/* PRICE */}
                  <td>
                    ₹{itemPrice.toFixed(2)}
                  </td>

                  {/* QUANTITY */}
                  <td>
                    {quantity}
                  </td>

                  {/* SUBTOTAL */}
                  <td>
                    ₹{subtotal.toFixed(2)}
                  </td>

                  {/* ACTION */}
                  <td>
                    <button
                      className="cartremove-btn"
                      onClick={() =>
                        removeFromCart(
                          item.productId
                        )
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* =====================================================
          ORDER SUMMARY
      ===================================================== */}

      <div className="cart-summary">

        <h3>
          Cart Summary
        </h3>

        <div className="summary-row">
          <span>
            Subtotal
          </span>

          <span>
            ₹{totalCost.toFixed(2)}
          </span>
        </div>

        <div className="summary-row">
          <span>
            Shipping
          </span>

          <span className="free-text">
            Free
          </span>
        </div>

        <div className="summary-row">
          <span>
            Estimate For
          </span>

          <span>
            India
          </span>
        </div>

        <div className="divider-2" />

        <div className="summary-total">

          <strong>
            Total
          </strong>

          <strong>
            ₹{totalCost.toFixed(2)}
          </strong>

        </div>

        <button
          className="checkout-btn"
          onClick={() =>
            navigate("/checkout")
          }
        >
          Proceed to Checkout
        </button>

      </div>
    </div>
  );
};