import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../api.js";

import "./AllOrders.css";

export const AllOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  // FETCH LOGGED-IN CUSTOMER ORDERS
  // =========================================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          "/orders/my-orders"
        );

        setOrders(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.orders)
              ? data.orders
              : []
        );
      } catch (err) {
        console.error(
          "❌ ALL ORDERS ERROR:",
          err
        );

        setOrders([]);

        if (err.response?.status === 401) {
          setError(
            "Please login to view your orders."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load orders."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // =========================================================
  // FORMAT DATE
  // =========================================================

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

  // =========================================================
  // GET PRODUCT IMAGE
  // =========================================================

  const getProductImage = (item) => {
    try {
      if (
        Array.isArray(item?.productImages) &&
        item.productImages.length > 0
      ) {
        return item.productImages[0];
      }

      if (item?.product_image) {
        return item.product_image;
      }

      if (
        Array.isArray(item?.images) &&
        item.images.length > 0
      ) {
        return item.images[0];
      }

      if (item?.image) {
        return item.image;
      }

      return null;
    } catch {
      return null;
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="all-orders-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="all-orders-header">

        <div>
          <h1>My Orders</h1>

          <p>
            View and track all your orders
          </p>
        </div>

        <button
          type="button"
          className="btn btn-back"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="orders-loading">
          Loading your orders...
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (
        <div className="orders-error">

          <p>{error}</p>

          {error
            .toLowerCase()
            .includes("login") && (
            <button
              type="button"
              className="track-order-btn"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>
          )}

        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="no-orders">

            <h3>No orders found</h3>

            <p>
              You have not placed any orders yet.
            </p>

          </div>
        )}

      {/* =====================================================
          ORDERS
      ===================================================== */}

      {!loading &&
        !error &&
        orders.length > 0 && (

          <div className="orders-list">

            {orders.map((order) => {

              const items = Array.isArray(
                order.items
              )
                ? order.items
                : [];

              const itemCount =
                items.length ||
                Number(order.item_count) ||
                0;

              return (

                <div
                  className="order-card"
                  key={order.id}
                >

                  {/* =========================================
                      ORDER HEADER
                  ========================================= */}

                  <div className="order-card-top">

                    <div className="order-info">

                      <span className="order-label">
                        Order ID
                      </span>

                      <h3>
                        #{order.id}
                      </h3>

                    </div>

                    <div
                      className={`order-status ${String(
                        order.status || "pending"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {order.status || "Pending"}
                    </div>

                  </div>

                  {/* =========================================
                      ORDER DETAILS
                  ========================================= */}

                  <div className="order-card-details">

                    <div>
                      <span>
                        Order Date
                      </span>

                      <strong>
                        {formatDate(
                          order.orderDate ||
                            order.order_date ||
                            order.created_at ||
                            order.createdAt
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total Amount
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.totalCost ??
                            order.total ??
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total Items
                      </span>

                      <strong>
                        {itemCount}
                      </strong>
                    </div>

                  </div>

                  {/* =========================================
                      ORDER ITEMS BREAKDOWN
                  ========================================= */}

                  {items.length > 0 && (

                    <div className="order-items-breakdown">

                      <h4>
                        Order Items
                      </h4>

                      <div className="order-items-list">

                        {items.map(
                          (item, index) => {

                            const productImage =
                              getProductImage(
                                item
                              );

                            const productName =
                              item.productTitle ||
                              item.product_title ||
                              item.title ||
                              item.name ||
                              item.description ||
                              "Product";

                            const imageUrl =
                              getImageUrl(
                                productImage
                              );

                            const quantity =
                              Number(
                                item.quantity ?? 1
                              );

                            const itemPrice =
                              Number(
                                item.amount ??
                                  item.productPrice ??
                                  item.product_price ??
                                  item.price ??
                                  0
                              );

                            return (

                              <div
                                className="order-item-row"
                                key={
                                  item.id ||
                                  `${order.id}-${index}`
                                }
                              >

                                {/* PRODUCT IMAGE */}

                                <div className="order-item-image">

                                  {imageUrl ? (

                                    <img
                                      src={imageUrl}
                                      alt={
                                        productName
                                      }
                                    />

                                  ) : (

                                    <div className="product-image-placeholder">
                                      📦
                                    </div>

                                  )}

                                </div>

                                {/* PRODUCT DETAILS */}

                                <div className="order-item-info">

                                  <h5>
                                    {productName}
                                  </h5>

                                  {item.description &&
                                    item.description !==
                                      productName && (

                                      <p>
                                        {
                                          item.description
                                        }
                                      </p>

                                    )}

                                  <span>
                                    Quantity:{" "}
                                    <strong>
                                      {quantity}
                                    </strong>
                                  </span>

                                </div>

                                {/* PRICE */}

                                <div className="order-item-price">

                                  ₹
                                  {itemPrice.toLocaleString(
                                    "en-IN"
                                  )}

                                </div>

                              </div>

                            );
                          }
                        )}

                      </div>

                    </div>

                  )}

                  {/* =========================================
                      ORDER FOOTER
                  ========================================= */}

                  <div className="order-card-footer">

                    <div className="customer-info">

                      <strong>
                        Payment
                      </strong>

                      <span>
                        {order.paymentStatus ||
                          order.payment_status ||
                          "Pending"}
                      </span>

                    </div>

                    <button
                      type="button"
                      className="track-order-btn"
                      onClick={() =>
                        navigate(
                          "/track-order",
                          {
                            state: {
                              orderId:
                                order.id,
                            },
                          }
                        )
                      }
                    >
                      Track Order →
                    </button>

                  </div>

                </div>

              );
            })}

          </div>
        )}

    </div>
  );
};