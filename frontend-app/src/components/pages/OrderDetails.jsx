import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api.js";
import "./OrderDetails.css";

export const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getImageUrl = (image) => {
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const getProductImage = (item) => {
    if (Array.isArray(item?.productImages) && item.productImages.length > 0) {
      return item.productImages[0];
    }

    if (item?.product_image) {
      return item.product_image;
    }

    if (Array.isArray(item?.images) && item.images.length > 0) {
      return item.images[0];
    }

    if (item?.image) {
      return item.image;
    }

    return null;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status) => {
    return String(status || "Pending")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * Uses the customer order endpoint.
         *
         * The backend should return either:
         * {
         *   id: 60,
         *   items: [],
         *   ...
         * }
         *
         * OR:
         * {
         *   order: {...}
         * }
         */

        const { data } = await api.get(`/orders/${orderId}`);

        const orderData =
          data?.order ||
          data?.data ||
          data;

        if (!orderData || !orderData.id) {
          throw new Error("Order not found.");
        }

        setOrder(orderData);
      } catch (err) {
        console.error("❌ ORDER DETAILS ERROR:", err);

        if (err.response?.status === 401) {
          setError("Please login to view this order.");
        } else if (err.response?.status === 404) {
          setError("Order not found.");
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load order details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-details-container">
        <div className="order-details-loading">
          Loading order details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-container">
        <div className="order-details-error">
          <h2>Unable to Load Order</h2>
          <p>{error}</p>

          <button
            type="button"
            className="order-back-btn"
            onClick={() => navigate("/orders")}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-container">
        <div className="order-details-error">
          <h2>Order Not Found</h2>

          <button
            type="button"
            className="order-back-btn"
            onClick={() => navigate("/orders")}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const status = order.status || "Pending";

  const totalAmount = Number(
    order.totalCost ??
      order.total ??
      order.total_amount ??
      0
  );

  const subtotal = Number(
    order.subtotal ??
      order.sub_total ??
      order.subTotal ??
      totalAmount
  );

  const shipping = Number(
    order.shipping ??
      order.shipping_charge ??
      order.delivery_charge ??
      0
  );

  const discount = Number(
    order.discount ??
      order.discount_amount ??
      0
  );

  const paymentStatus =
    order.paymentStatus ||
    order.payment_status ||
    "Pending";

  const paymentMethod =
    order.paymentMethod ||
    order.payment_method ||
    "N/A";

  const orderDate =
    order.orderDate ||
    order.order_date ||
    order.created_at ||
    order.createdAt;

  const address =
    order.orderAddress ||
    order.address ||
    order.shippingAddress ||
    order.shipping_address ||
    null;

  return (
    <div className="order-details-container">

      {/* HEADER */}
      <div className="order-details-header">

        <div>
          <button
            type="button"
            className="order-back-link"
            onClick={() => navigate("/orders")}
          >
            ← Back to Orders
          </button>

          <h1>Order Details</h1>

          <p>
            Order #{order.id}
          </p>
        </div>

        <div
          className={`order-details-status ${getStatusClass(
            status
          )}`}
        >
          {status}
        </div>

      </div>


      {/* ORDER SUMMARY */}
      <div className="order-details-summary">

        <div>
          <span>Order ID</span>
          <strong>#{order.id}</strong>
        </div>

        <div>
          <span>Order Date</span>
          <strong>{formatDate(orderDate)}</strong>
        </div>

        <div>
          <span>Payment Status</span>
          <strong>{paymentStatus}</strong>
        </div>

        <div>
          <span>Payment Method</span>
          <strong>{paymentMethod}</strong>
        </div>

      </div>


      {/* ORDER ITEMS */}
      <div className="order-details-card">

        <div className="order-details-card-header">
          <h2>Order Items</h2>

          <span>
            {items.length}{" "}
            {items.length === 1 ? "Item" : "Items"}
          </span>
        </div>


        <div className="order-details-items">

          {items.length === 0 ? (
            <div className="order-no-items">
              No order items available.
            </div>
          ) : (
            items.map((item, index) => {

              const image = getProductImage(item);

              const imageUrl = getImageUrl(image);

              const productName =
                item.productTitle ||
                item.product_title ||
                item.title ||
                item.name ||
                item.description ||
                "Product";

              const quantity = Number(
                item.quantity ?? 1
              );

              const price = Number(
                item.amount ??
                  item.productPrice ??
                  item.product_price ??
                  item.price ??
                  0
              );

              const itemTotal =
                price * quantity;

              return (
                <div
                  className="order-details-item"
                  key={
                    item.id ||
                    `${order.id}-${index}`
                  }
                >

                  <div className="order-details-item-image">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={productName}
                      />
                    ) : (
                      <div className="order-image-placeholder">
                        📦
                      </div>
                    )}

                  </div>


                  <div className="order-details-item-info">

                    <h3>{productName}</h3>

                    {item.description &&
                      item.description !==
                        productName && (
                        <p>
                          {item.description}
                        </p>
                      )}

                    <span>
                      Quantity:{" "}
                      <strong>
                        {quantity}
                      </strong>
                    </span>

                  </div>


                  <div className="order-details-item-price">

                    <span>
                      ₹
                      {price.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>

                    <small>
                      Total: ₹
                      {itemTotal.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </small>

                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>


      {/* ADDRESS + PRICE */}
      <div className="order-details-two-column">


        {/* DELIVERY ADDRESS */}
        <div className="order-details-card">

          <div className="order-details-card-header">
            <h2>Delivery Address</h2>
          </div>

          {address ? (
            <div className="delivery-address">

              {address.fullName && (
                <strong>
                  {address.fullName}
                </strong>
              )}

              {address.name &&
                !address.fullName && (
                  <strong>
                    {address.name}
                  </strong>
                )}

              {address.mobile && (
                <p>
                  📱 {address.mobile}
                </p>
              )}

              {address.addressLine1 && (
                <p>
                  {address.addressLine1}
                </p>
              )}

              {address.addressLine2 && (
                <p>
                  {address.addressLine2}
                </p>
              )}

              {address.address && (
                <p>
                  {address.address}
                </p>
              )}

              <p>
                {[
                  address.city,
                  address.state,
                  address.pincode ||
                    address.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {address.country && (
                <p>
                  {address.country}
                </p>
              )}

            </div>
          ) : (
            <div className="order-address-empty">
              Delivery address not available.
            </div>
          )}

        </div>


        {/* PRICE SUMMARY */}
        <div className="order-details-card">

          <div className="order-details-card-header">
            <h2>Price Summary</h2>
          </div>

          <div className="price-summary">

            <div>
              <span>Subtotal</span>
              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

            <div>
              <span>Shipping</span>
              <strong>
                ₹
                {shipping.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

            {discount > 0 && (
              <div className="discount-row">
                <span>Discount</span>
                <strong>
                  -₹
                  {discount.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>
              </div>
            )}

            <div className="price-summary-total">
              <span>Total</span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* FOOTER ACTIONS */}
      <div className="order-details-actions">

        <button
          type="button"
          className="order-back-btn"
          onClick={() => navigate("/orders")}
        >
          ← Back to Orders
        </button>

        {String(status).toLowerCase() !==
          "cancelled" && (
          <button
            type="button"
            className="order-track-details-btn"
            onClick={() =>
              navigate("/trackmyorder", {
                state: {
                  orderId: order.id,
                },
              })
            }
          >
            📍 Track Order
          </button>
        )}

      </div>

    </div>
  );
};

export default OrderDetails;