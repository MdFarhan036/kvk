import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api.js";
import { useCustomerAuth } from "../../../context/CustomerContext";

import CommonFilterBar from "../../common/CommonFilterBar.jsx";
import CommonPagination from "../../common/CommonPagination.jsx";
import usePagination from "../../../hooks/usePagination.js";

import "./MyOrders.css";

export const MyOrders = () => {
  const navigate = useNavigate();

  const { customer } = useCustomerAuth();

  const customerId = customer?.id;

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [sortOrder, setSortOrder] = useState("newest");

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(
          `/orders/customer/${customerId}`
        );

        setOrders(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      } catch (err) {
        console.error(
          "❌ Failed to load orders:",
          err
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]);

  // =====================================================
  // CANCEL ORDER
  // =====================================================

  const cancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Cancel this order?"
      )
    ) {
      return;
    }

    try {
      await api.put(
        `/orders/${orderId}`,
        {
          status: "Cancelled",
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          Number(order.id) ===
          Number(orderId)
            ? {
                ...order,
                status: "Cancelled",
              }
            : order
        )
      );
    } catch (err) {
      console.error(
        "❌ Failed to cancel order:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to cancel order"
      );
    }
  };

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // SEARCH

    const searchValue = search
      .trim()
      .toLowerCase();

    if (searchValue) {
      result = result.filter(
        (order) =>
          String(order.id || "")
            .toLowerCase()
            .includes(searchValue)
      );
    }

    // STATUS

    if (statusFilter !== "All") {
      result = result.filter(
        (order) =>
          String(
            order.status || ""
          ).toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    // SORT

    result.sort((a, b) => {
      const dateA = new Date(
        a.orderDate || 0
      ).getTime();

      const dateB = new Date(
        b.orderDate || 0
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

  // =====================================================
  // PAGINATION
  // =====================================================

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

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="orders-container">
        <p>
          Loading orders...
        </p>
      </div>
    );
  }

  // =====================================================
  // LOGIN
  // =====================================================

  if (!customerId) {
    return (
      <div className="orders-container">
        <h2>
          Please login to view
          your orders.
        </h2>

        <button
          onClick={() =>
            navigate("/login")
          }
        >
          Login
        </button>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="orders-container">

      <h1>
        My Orders
      </h1>

      {/* =================================================
          COMMON FILTER
      ================================================= */}

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
                  value: "oldest",
                },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setStatusFilter("All");
            setSortOrder("newest");
          }}
        />
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {orders.length === 0 ? (
        <div className="orders-empty">

          <h3>
            No orders found
          </h3>

          <p>
            You haven't placed
            any orders yet.
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
          >
            Start Shopping
          </button>

        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty">

          <h3>
            No matching orders
          </h3>

          <p>
            Try changing your
            search or filters.
          </p>

        </div>
      ) : (
        <>
          {/* =================================================
              RESULT COUNT
          ================================================= */}

          <div className="orders-result-info">

            Showing{" "}
            <strong>
              {startIndex}
            </strong>

            {" - "}

            <strong>
              {endIndex}
            </strong>

            {" of "}

            <strong>
              {totalItems}
            </strong>

            {" orders"}

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="orders-table-wrapper">

            <table className="table">

              <thead>
                <tr>
                  <th>
                    Order ID
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {paginatedData.map(
                  (order) => {

                    const status =
                      String(
                        order.status ||
                          ""
                      ).toLowerCase();

                    return (
                      <tr
                        key={order.id}
                      >

                        <td>
                          <strong>
                            #{order.id}
                          </strong>
                        </td>

                        <td>
                          {order.orderDate
                            ? new Date(
                                order.orderDate
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td>
                          <span
                            className={`order-status order-status-${status}`}
                          >
                            {order.status ||
                              "Pending"}
                          </span>
                        </td>

                        <td>
                          ₹
                          {Number(
                            order.totalCost ||
                              0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </td>

                        <td>

                          <div className="order-actions">

                            {/* VIEW */}

                            <button
                              className="order-view-btn"
                              onClick={() =>
                                navigate(
                                  `/orders/${order.id}`
                                )
                              }
                            >
                              View
                            </button>

                            {/* TRACK ORDER */}

                            {(status ===
                              "processing" ||
                              status ===
                                "shipped") && (
                              <button
                                className="order-track-btn"
                                onClick={() =>
                                  navigate(
                                    `/orders/${order.id}/tracking`
                                  )
                                }
                              >
                                Track Order
                              </button>
                            )}

                            {/* CANCEL */}

                            {status ===
                              "pending" && (
                              <button
                                className="order-cancel-btn"
                                onClick={() =>
                                  cancelOrder(
                                    order.id
                                  )
                                }
                              >
                                Cancel
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              COMMON PAGINATION
          ================================================= */}

          <CommonPagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPageChange={
              setCurrentPage
            }
          />

        </>
      )}

    </div>
  );
};

export default MyOrders;
