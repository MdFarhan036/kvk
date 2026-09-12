import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api, { ASSET_BASE_URL } from "../api";
import "./Allorders.css";

export const OrdersTable = () => {
  const { customerId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [sortOption, setSortOption] = useState("Newest");
  const [showCount, setShowCount] = useState(50);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isShowOpen, setIsShowOpen] = useState(false);

  // ============================================
  // FETCH ORDERS
  // ============================================
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      try {
        const url = customerId
          ? `/orders/customer/${customerId}`
          : `/orders`;

        const { data } = await api.get(url);

        const formatted = Array.isArray(data)
          ? data.map((order) => ({
              ...order,
              items: Array.isArray(order.items) ? order.items : [],
            }))
          : [];

        setOrders(formatted);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]);

  // ============================================
  // EXPAND / COLLAPSE ORDER
  // ============================================
  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // ============================================
  // SEARCH & FILTER
  // ============================================
  let filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();

    return (
      o.id.toString().includes(q) ||
      (o.status || "").toLowerCase().includes(q) ||
      (o.customerName || "").toLowerCase().includes(q)
    );
  });

  if (activeTab !== "All") {
    filteredOrders = filteredOrders.filter(
      (o) =>
        (o.status || "").toLowerCase() === activeTab.toLowerCase()
    );
  }

  // ============================================
  // SORT
  // ============================================
  filteredOrders.sort((a, b) => {
    return sortOption === "Newest"
      ? new Date(b.orderDate) - new Date(a.orderDate)
      : new Date(a.orderDate) - new Date(b.orderDate);
  });

  // ============================================
  // SHOW COUNT
  // ============================================
  const displayedOrders =
    showCount === "All"
      ? filteredOrders
      : filteredOrders.slice(0, Number(showCount));

  // ============================================
  // STATUS OPTIONS
  // ============================================
  const validStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const uniqueStatuses = [
    "All",
    ...new Set(orders.map((o) => o.status)),
  ];

  // ============================================
  // UPDATE ORDER STATUS
  // ============================================
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus }
            : o
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status");
    }
  };

  // ============================================
  // EDIT ITEM
  // ============================================
  const handleItemChange = (
    orderId,
    idx,
    field,
    value
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item, i) =>
                i === idx
                  ? {
                      ...item,
                      [field]: value,
                    }
                  : item
              ),
            }
          : order
      )
    );
  };

  // ============================================
  // SAVE ITEM
  // ============================================
  const saveItemChange = async (orderId, idx) => {
    const order = orders.find(
      (o) => o.id === orderId
    );

    const item = order.items[idx];

    try {
      await api.put(
        `/orders/${orderId}/items/${item.id}`,
        item
      );

      alert("Item updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update item");
    }
  };

  // ============================================
  // DELETE ITEM
  // ============================================
  const deleteItem = async (orderId, idx) => {
    const order = orders.find(
      (o) => o.id === orderId
    );

    const item = order.items[idx];

    // Local item without database ID
    if (!item?.id) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                items: o.items.filter(
                  (_, i) => i !== idx
                ),
              }
            : o
        )
      );

      return;
    }

    try {
      await api.delete(
        `/orders/${orderId}/items/${item.id}`
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                items: o.items.filter(
                  (_, i) => i !== idx
                ),
              }
            : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  return (
    <main className="all-adminorders">

      {/* HEADER */}
      <div className="orders-header">
        <h2>
          {customerId
            ? `Orders for Customer: ${
                orders[0]?.customerName || ""
              }`
            : "All Orders"}
        </h2>

        <Link to="/allorders/addOrder">
          <button className="upload-btn">
            + Add Order
          </button>
        </Link>
      </div>

      {/* STATUS TABS */}
      <div className="tabs-nav">
        {uniqueStatuses.map((status) => (
          <div
            key={status}
            className={`tab ${
              activeTab === status ? "active" : ""
            }`}
            onClick={() => setActiveTab(status)}
          >
            {status}
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="admin-orders-body-top">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="🔍 Search orders..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* SORT */}
        <div className="strip-bar-tab-btn2">
          <button
            onClick={() =>
              setIsSortOpen(!isSortOpen)
            }
          >
            Sort by: {sortOption}
          </button>

          {isSortOpen && (
            <ul className="dropdownMenu">
              {["Newest", "Oldest"].map((opt) => (
                <li key={opt}>
                  <button
                    onClick={() => {
                      setSortOption(opt);
                      setIsSortOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SHOW COUNT */}
        <div className="strip-bar-tab-btn1">
          <button
            onClick={() =>
              setIsShowOpen(!isShowOpen)
            }
          >
            Show: {showCount}
          </button>

          {isShowOpen && (
            <ul className="dropdownMenu">
              {[50, 100, 150, 200, "All"].map(
                (count) => (
                  <li key={count}>
                    <button
                      onClick={() => {
                        setShowCount(count);
                        setIsShowOpen(false);
                      }}
                    >
                      {count}
                    </button>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="orders-table-wrapper">
          <table className="table-customer">

            <thead>
              <tr>
                <th></th>
                <th>Date</th>
                <th>Order ID</th>
                <th>Tracking</th>
                <th>Customer</th>
                <th>Total Cost</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {displayedOrders.length ? (
                displayedOrders.map((order) => (
                  <React.Fragment key={order.id}>

                    {/* ORDER ROW */}
                    <tr>
                      <td>
                        <button
                          className="expand-btn"
                          onClick={() =>
                            toggleExpand(order.id)
                          }
                        >
                          {expandedOrders.includes(
                            order.id
                          )
                            ? "−"
                            : "+"}
                        </button>
                      </td>

                      <td>
                        {new Date(
                          order.orderDate
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <Link
                          to={
                            customerId
                              ? `/customers/customer/${customerId}/orders/${order.id}/details`
                              : `/allorders/${order.id}/details`
                          }
                        >
                          {order.id}
                        </Link>
                      </td>

                      <td>
                        <Link
                          to={`/allorders/${order.id}/track`}
                          state={{
                            orderId: order.id,
                          }}
                        >
                          Track
                        </Link>
                      </td>

                      <td>
                        {order.customerName || "N/A"}
                      </td>

                      <td>
                        ₹
                        {Number(
                          order.totalCost || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value
                            )
                          }
                        >
                          {validStatuses.map((s) => (
                            <option
                              key={s}
                              value={s}
                            >
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* EXPANDED ITEMS */}
                    {expandedOrders.includes(
                      order.id
                    ) && (
                      <tr className="order-items-row">
                        <td colSpan="7">

                          <table className="order-items-table">

                            <thead>
                              <tr>
                                <th>
                                  Product Name
                                </th>
                                <th>
                                  Description
                                </th>
                                <th>Amount</th>
                                <th>Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {order.items.length ? (
                                order.items.map(
                                  (item, idx) => (
                                    <tr key={idx}>

                                      {/* PRODUCT */}
                                      <td>
                                        <div className="order-item-product">

                                          <strong>
                                            {item.productTitle ||
                                              "N/A"}
                                          </strong>

                                          {item.productPrice !=
                                            null && (
                                            <div>
                                              ₹
                                              {Number(
                                                item.productPrice
                                              ).toFixed(2)}
                                            </div>
                                          )}

                                          {item
                                            .productImages?.[0] && (
                                            <img
                                              src={`${ASSET_BASE_URL}${item.productImages[0]}`}
                                              alt={
                                                item.productTitle ||
                                                "Product"
                                              }
                                              style={{
                                                width: 50,
                                                height: 50,
                                                objectFit:
                                                  "cover",
                                                borderRadius: 4,
                                                marginTop: 4,
                                              }}
                                            />
                                          )}
                                        </div>
                                      </td>

                                      {/* DESCRIPTION */}
                                      <td>
                                        <input
                                          type="text"
                                          value={
                                            item.description ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleItemChange(
                                              order.id,
                                              idx,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>

                                      {/* AMOUNT */}
                                      <td>
                                        <input
                                          type="number"
                                          value={
                                            item.amount
                                          }
                                          onChange={(e) =>
                                            handleItemChange(
                                              order.id,
                                              idx,
                                              "amount",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>

                                      {/* ACTIONS */}
                                      <td>
                                        <button
                                          onClick={() =>
                                            saveItemChange(
                                              order.id,
                                              idx
                                            )
                                          }
                                        >
                                          Save
                                        </button>

                                        <button
                                          style={{
                                            marginLeft: 6,
                                          }}
                                          onClick={() =>
                                            deleteItem(
                                              order.id,
                                              idx
                                            )
                                          }
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                )
                              ) : (
                                <tr>
                                  <td
                                    colSpan="4"
                                    style={{
                                      textAlign:
                                        "center",
                                    }}
                                  >
                                    No items found
                                  </td>
                                </tr>
                              )}
                            </tbody>

                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      )}
    </main>
  );
};