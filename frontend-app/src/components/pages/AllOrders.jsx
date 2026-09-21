import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerContext";

import CommonFilterBar from "../common/CommonFilterBar.jsx";
import CommonPagination from "../common/CommonPagination.jsx";
import usePagination from "../../hooks/usePagination.js";

import api, { ASSET_BASE_URL } from "../api.js";

import "./AllOrders.css";

export const AllOrders = () => {
  const navigate = useNavigate();

  const { customer } = useCustomerAuth();
  const customerId = customer?.id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  // =========================================================
  // IMAGE URL HELPER
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${image.startsWith("/") ? "" : "/"
      }${image}`;
  };

  // =========================================================
  // PRODUCT IMAGE HELPER
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
  // FETCH CUSTOMER ORDERS
  // =========================================================

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          `/orders/customer/${customerId}`
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
  }, [customerId]);

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
  // CANCEL ORDER
  // =========================================================

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      await api.put(`/orders/${orderId}`, {
        status: "Cancelled",
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          Number(order.id) === Number(orderId)
            ? {
              ...order,
              status: "Cancelled",
            }
            : order
        )
      );

      alert("Order cancelled successfully.");
    } catch (err) {
      console.error(
        "❌ Failed to cancel order:",
        err
      );

      alert(
        err?.response?.data?.message ||
        "Failed to cancel order."
      );
    }
  };

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // SEARCH
    const searchValue = search
      .trim()
      .toLowerCase();

    if (searchValue) {
      result = result.filter((order) =>
        String(order.id || "")
          .toLowerCase()
          .includes(searchValue)
      );
    }

    // STATUS
    if (statusFilter !== "All") {
      result = result.filter(
        (order) =>
          String(order.status || "")
            .toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    // SORT
    result.sort((a, b) => {
      const dateA = new Date(
        a.orderDate ||
        a.order_date ||
        a.created_at ||
        a.createdAt ||
        0
      ).getTime();

      const dateB = new Date(
        b.orderDate ||
        b.order_date ||
        b.created_at ||
        b.createdAt ||
        0
      ).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    orders,
    search,
    statusFilter,
    sortOrder,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(
    filteredOrders,
    10
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="all-orders-container">
        <div className="orders-loading">
          Loading your orders...
        </div>
      </div>
    );
  }

  // =========================================================
  // LOGIN
  // =========================================================

  if (!customerId) {
    return (
      <div className="all-orders-container">
        <div className="orders-error">
          <p>Please login to view your orders.</p>

          <button
            type="button"
            className="track-order-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

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
          FILTER BAR
      ===================================================== */}

      {orders.length > 0 && (
        <CommonFilterBar
          search={search}
          setSearch={setSearch}
          searchPlaceholder="Search Order ID"
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                {
                  label: "All Orders",
                  value: "All",
                },
                {
                  label: "Pending",
                  value: "Pending",
                },
                {
                  label: "Processing",
                  value: "Processing",
                },
                {
                  label: "Shipped",
                  value: "Shipped",
                },
                {
                  label: "Delivered",
                  value: "Delivered",
                },
                {
                  label: "Cancelled",
                  value: "Cancelled",
                },
              ],
            },
            {
              key: "sort",
              label: "Sort By",
              value: sortOrder,
              onChange: setSortOrder,
              options: [
                {
                  label: "Newest First",
                  value: "newest",
                },
                {
                  label: "Oldest First",
                  value: "Oldest",
                },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setStatusFilter("All");
            setSortOrder("newest");
            setCurrentPage(1);
          }}
        />
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!error &&
        orders.length === 0 && (
          <div className="no-orders">
            <h3>No orders found</h3>

            <p>
              You have not placed any orders yet.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Start Shopping
            </button>
          </div>
        )}

      {error && (
        <div className="orders-error">
          <p>{error}</p>

          {error
            .toLowerCase()
            .includes("login") && (
              <button
                type="button"
                className="track-order-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}
        </div>
      )}

      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      {!error && orders.length > 0 && (
        <>
          <div className="orders-result-info">
            Showing{" "}
            <strong>{startIndex}</strong>
            {" - "}
            <strong>{endIndex}</strong>
            {" of "}
            <strong>{totalItems}</strong>
            {" orders"}
          </div>

          {/* =================================================
              NO MATCHING ORDERS
          ================================================= */}

          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <h3>No matching orders</h3>

              <p>
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            /* =================================================
               ORDERS
            ================================================= */

            <div className="orders-list">

              {paginatedData.map((order) => {
                const items = Array.isArray(
                  order.items
                )
                  ? order.items
                  : [];

                const itemCount =
                  items.length ||
                  Number(order.item_count) ||
                  0;

                const status =
                  order.status || "Pending";

                const statusClass = String(status)
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                const totalAmount = Number(
                  order.totalCost ??
                  order.total ??
                  0
                );

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
                        className={`order-status ${statusClass}`}
                      >
                        {status}
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
                          {totalAmount.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
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
    DELIVERY VERIFICATION CODE
========================================= */}

                    {String(status).toLowerCase() === "shipped" &&
                      order.deliveryVerificationCode && (
                        <div className="delivery-verification-card">
                          <div className="delivery-verification-icon">
                            🔐
                          </div>

                          <div className="delivery-verification-content">
                            <span className="delivery-verification-label">
                              Delivery Verification Code
                            </span>

                            <strong className="delivery-verification-code">
                              {order.deliveryVerificationCode}
                            </strong>

                            <p>
                              Share this code with the delivery person
                              only when your order arrives.
                            </p>
                          </div>
                        </div>
                      )}
                    {/* =========================================
                        ORDER ITEMS
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
                                      "en-IN",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
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

                      <div className="order-footer-actions">

                        {/* CANCEL */}

                        {String(status).toLowerCase() ===
                          "pending" && (
                            <button
                              type="button"
                              className="order-cancel-btn"
                              onClick={() =>
                                cancelOrder(
                                  order.id
                                )
                              }
                            >
                              Cancel Order
                            </button>
                          )}

                        {/* VIEW */}

                        <button
                          type="button"
                          className="order-view-btn"
                          onClick={() =>
                            navigate(`/orders/${order.id}`)
                          }
                        >
                          View Order
                        </button>

                        {/* TRACK */}

                        {String(status).toLowerCase() !==
                          "cancelled" && (
                            <button
                              type="button"
                              className="track-order-btn"
                              onClick={() =>
                                navigate("/trackmyorder", {
                                  state: {
                                    orderId: order.id,
                                  },
                                })
                              }
                            >
                              Track Order →
                            </button>
                          )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {filteredOrders.length > 0 && (
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

        </>
      )}

    </div>
  );
};

export default AllOrders;
