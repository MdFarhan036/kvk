import { Link } from "react-router-dom";
import wishlistimg from "../../assets/wishlist.png";
import previewimg from "../../assets/eyeicon.jpg";
import { ASSET_BASE_URL } from "../../api.js";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export const ListingProductPage = ({ catproducts1 }) => {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  // =========================================================
  // IMAGE URL
  // =========================================================
  const getImageUrl = (url) => {
    if (!url) return "";

    if (typeof url !== "string") return "";

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${ASSET_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // =========================================================
  // PRODUCT DATA
  // =========================================================
  const productId = catproducts1?.id;

  const productTitle =
    catproducts1?.title ||
    catproducts1?.name ||
    "Product";

  const category =
    catproducts1?.category_name ||
    catproducts1?.category?.name ||
    catproducts1?.name ||
    "";

  const vendor =
    catproducts1?.vendorname ||
    catproducts1?.vendor_name ||
    catproducts1?.brand ||
    "";

  const description =
    catproducts1?.description ||
    catproducts1?.pdescription ||
    "";

  const originalPrice =
    catproducts1?.oldPrice ??
    catproducts1?.old_price ??
    catproducts1?.orgprice ??
    catproducts1?.price ??
    0;

  const sellingPrice =
    catproducts1?.price ??
    catproducts1?.disprice ??
    0;

  // =========================================================
  // IMAGE
  // =========================================================
  const productImage =
    catproducts1?.pimage ||
    catproducts1?.image ||
    catproducts1?.images?.[0] ||
    "";

  const imageUrl = getImageUrl(productImage);

  // =========================================================
  // STOCK
  // =========================================================
  const stock = Number(catproducts1?.stock ?? 0);

  const inStock =
    catproducts1?.status === "Inactive"
      ? false
      : stock > 0;

  // =========================================================
  // WISHLIST
  // =========================================================
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof addToWishlist === "function") {
      addToWishlist(catproducts1);
    }
  };

  // =========================================================
  // CART
  // =========================================================
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) return;

    if (typeof addToCart === "function") {
      addToCart({
        ...catproducts1,
        id: productId,
        title: productTitle,
        name: productTitle,
        price: sellingPrice,
        image: productImage,
        images: catproducts1?.images || [productImage],
        category_name: category,
        stock,
        quantity: 1,
      });
    }
  };

  return (
    <div className="product-card">

      {/* Badge */}
      <span className="product-badge">Hot</span>

      {/* Image */}
      <Link
        to={`/product/${productId}`}
        className="product-imgcard"
      >
        {imageUrl ? (
          <img
            className="product-image"
            src={imageUrl}
            alt={productTitle}
            loading="lazy"
          />
        ) : (
          <div className="product-image no-product-image">
            No Image
          </div>
        )}

        {/* Overlay */}
        <div className="img_overlay">
          <ul className="list-product-overlay">

            {/* Wishlist */}
            <li className="list-item-overlay">
              <button
                type="button"
                aria-label="Add to wishlist"
                onClick={handleWishlist}
              >
                <img
                  src={wishlistimg}
                  alt=""
                />
              </button>
            </li>

            {/* Quick Preview */}
            <li className="list-item-overlay">
              <button
                type="button"
                aria-label="Quick preview"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <img
                  src={previewimg}
                  alt=""
                />
              </button>
            </li>

          </ul>
        </div>
      </Link>

      {/* Content */}
      <div className="product-contentcard">

        {/* Category */}
        {category && (
          <span className="catName">
            {category}
          </span>
        )}

        {/* Title */}
        <h2 className="products-name">
          <Link to={`/product/${productId}`}>
            {productTitle}
          </Link>
        </h2>

        {/* Ratings */}
        <div
          className="product-ratings"
          aria-label={`Rating: ${
            catproducts1?.rating || 0
          } out of 5`}
        >
          ⭐⭐⭐☆☆
        </div>

        {/* Description */}
        {description && (
          <h6 className="products-description">
            {description}
          </h6>
        )}

        {/* Vendor / Brand */}
        {vendor && (
          <h6 className="products-description product-vendor">
            By {vendor}
          </h6>
        )}

        {/* Price */}
        <div className="price">

          {Number(originalPrice) !== Number(sellingPrice) && (
            <span className="original-price">
              ₹{Number(originalPrice).toLocaleString("en-IN")}
            </span>
          )}

          <span className="discount-price">
            ₹{Number(sellingPrice).toLocaleString("en-IN")}
          </span>

        </div>

        {/* Add To Cart */}
        <button
          className="addtocart"
          type="button"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <i className="fa-solid fa-cart-shopping"></i>

          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>

      </div>
    </div>
  );
};