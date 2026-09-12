import "./Wishlist.css";

import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useNavigate } from "react-router-dom";

import { ASSET_BASE_URL } from "../../api.js";

export const Wishlist = () => {
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const navigate = useNavigate();

  // =========================================================
  // IMAGE URL HELPER
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  // =========================================================
  // MOVE TO CART
  // =========================================================

  const handleMoveToCart = (item) => {
    addToCart({
      ...item,
      quantity: 1,
    });

    removeFromWishlist(item.id);

    alert(
      `${item.title || item.name} moved to cart!`
    );
  };

  // =========================================================
  // EMPTY WISHLIST
  // =========================================================

  if (
    !wishlistItems ||
    wishlistItems.length === 0
  ) {
    return (
      <p className="wishlist-empty">
        Your wishlist is empty.
      </p>
    );
  }

  return (
    <div className="wishlist-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="wishlist-header">

        <h1>
          Your Wishlist ({wishlistItems.length} items)
        </h1>

        <button
          type="button"
          onClick={clearWishlist}
          className="checkout-btn"
        >
          <i className="fa fa-trash"></i>{" "}
          Clear Wishlist
        </button>

      </div>

      {/* =====================================================
          WISHLIST TABLE
      ===================================================== */}

      <table className="table table-wishlist">

        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {wishlistItems.map((item) => {

            const imageValue =
              item.images?.[0] ||
              item.image ||
              "";

            const imageUrl =
              getImageUrl(imageValue);

            const productName =
              item.title ||
              item.name ||
              "Product";

            const stock =
              Number(item.stock ?? 0);

            return (
              <tr key={item.id}>

                {/* =========================================
                    IMAGE + PRODUCT NAME
                ========================================= */}

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
                          alt={productName}
                        />
                      ) : (
                        <span>
                          No Image
                        </span>
                      )}

                    </div>

                    <span>
                      {productName}
                    </span>

                  </div>

                </td>

                {/* =========================================
                    PRICE
                ========================================= */}

                <td>
                  ₹
                  {Number(
                    item.price ?? 0
                  ).toLocaleString("en-IN")}
                </td>

                {/* =========================================
                    STOCK
                ========================================= */}

                <td
                  className={
                    stock > 0
                      ? "in-stock"
                      : "out-stock"
                  }
                >
                  {stock > 0
                    ? "In Stock"
                    : "Out of Stock"}
                </td>

                {/* =========================================
                    ACTIONS
                ========================================= */}

                <td>

                  <button
                    type="button"
                    className="wishlist-action-btn"
                    disabled={stock <= 0}
                    onClick={() =>
                      handleMoveToCart(item)
                    }
                  >
                    Move to Cart
                  </button>

                  <button
                    type="button"
                    className="wishlist-remove-btn"
                    onClick={() =>
                      removeFromWishlist(item.id)
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

      {/* =====================================================
          GO TO CART
      ===================================================== */}

      <button
        type="button"
        onClick={() => navigate("/cart")}
        className="checkout-btn"
      >
        Go to Cart
      </button>

    </div>
  );
};