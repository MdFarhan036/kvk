import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../api";

import AssignDelivery from "../AssignDelivery.jsx";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

// ============================================
// LEAFLET DEFAULT MARKER ICON FIX
// ============================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deliveryAssignment, setDeliveryAssignment] =
    useState(null);

  const [showItems, setShowItems] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  // ============================================
  // FETCH ORDER
  // ============================================

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(
        `/orders/${orderId}`
      );

      setOrder({
        id: data.id || "N/A",

        invoice:
          data.invoice ||
          data.invoice_no ||
          `INV-${data.id}`,

        customerName:
          data.customerName || "N/A",

        email:
          data.email || "N/A",

        mobile:
          data.mobile || "N/A",

        orderAddress:
          data.orderAddress || null,

        orderDate:
          data.orderDate ||
          data.date ||
          null,

        totalCost:
          Number(data.totalCost || 0),

        status:
          data.status || "Pending",

        paymentMethod:
          data.paymentMethod || "N/A",

        paymentStatus:
          data.paymentStatus || "N/A",

        remarks:
          data.remarks || "",

        items:
          Array.isArray(data.items)
            ? data.items
            : [],

        logs:
          Array.isArray(data.logs)
            ? data.logs
            : [],

        promoCode:
          data.promoCode || "N/A",
      });
    } catch (err) {
      console.error(
        "❌ Error fetching order:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH DELIVERY ASSIGNMENT
  // ============================================

  const fetchDeliveryAssignment = async () => {
    try {
      const { data } = await api.get(
        "/delivery/assignments"
      );

      const assignments = Array.isArray(data)
        ? data
        : data?.assignments || [];

      const assignment = assignments.find(
        (item) =>
          Number(item.orderId) ===
          Number(orderId)
      );

      setDeliveryAssignment(
        assignment || null
      );
    } catch (err) {
      console.error(
        "❌ Error fetching delivery assignment:",
        err
      );

      // Do not block OrderDetails if assignment
      // endpoint fails.
      setDeliveryAssignment(null);
    }
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    fetchOrder();
    fetchDeliveryAssignment();
  }, [orderId]);

  // ============================================
  // REFRESH AFTER ASSIGNMENT
  // ============================================

  const handleDeliveryAssigned = async () => {
    await fetchDeliveryAssignment();
    await fetchOrder();
  };

  // ============================================
  // SAVE ORDER STATUS
  // ============================================

  const handleSaveStatus = async () => {
    if (!order) return;

    setSaving(true);

    try {
      await api.put(
        `/orders/${order.id}`,
        {
          status: order.status,
        }
      );

      alert(
        "✅ Order status updated successfully!"
      );

      await fetchOrder();
      await fetchDeliveryAssignment();
    } catch (err) {
      console.error(
        "❌ Failed to update order:",
        err
      );

      alert(
        "Failed to update order status."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // FORMAT PRICE
  // ============================================

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // ============================================
  // CHECK DELIVERY COORDINATES
  // ============================================

  const hasDeliveryCoordinates =
    order?.orderAddress &&
    order.orderAddress.latitude !== null &&
    order.orderAddress.latitude !== undefined &&
    order.orderAddress.longitude !== null &&
    order.orderAddress.longitude !== undefined &&
    Number.isFinite(
      Number(order.orderAddress.latitude)
    ) &&
    Number.isFinite(
      Number(order.orderAddress.longitude)
    );

  const deliveryLatitude =
    hasDeliveryCoordinates
      ? Number(
          order.orderAddress.latitude
        )
      : null;

  const deliveryLongitude =
    hasDeliveryCoordinates
      ? Number(
          order.orderAddress.longitude
        )
      : null;

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <p className="loading">
        Loading order details...
      </p>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return (
      <p className="error">
        {error}
      </p>
    );
  }

  if (!order) {
    return (
      <p className="error">
        No order found
      </p>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <main className="order-details-page">

      {/* ==========================================
          BACK
      ========================================== */}

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back to Orders
      </button>

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="order-header">

        <div>

          <h1>
            Order #{order.id}
          </h1>

          <span>
            Placed On:{" "}
            {order.orderDate
              ? new Date(
                  order.orderDate
                ).toLocaleString("en-IN")
              : "N/A"}
          </span>

        </div>

        <span className="admin-order-status">
          {order.status}
        </span>

      </div>

      {/* ==========================================
          CUSTOMER DETAILS
      ========================================== */}

      <div className="order-card">

        <h3>
          Customer Details
        </h3>

        <div className="order-basic-info">

          <p>
            <strong>Name:</strong>{" "}
            {order.customerName}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {order.email}
          </p>

          <p>
            <strong>Mobile:</strong>{" "}
            {order.mobile}
          </p>

          <p>
            <strong>Invoice:</strong>{" "}
            {order.invoice}
          </p>

        </div>

      </div>

      {/* ==========================================
          DELIVERY ASSIGNMENT
      ========================================== */}

      <AssignDelivery
        orderId={order.id}
        currentAssignment={
          deliveryAssignment
        }
        onAssigned={
          handleDeliveryAssigned
        }
      />

      {/* ==========================================
          DELIVERY ADDRESS
      ========================================== */}

      <div className="order-card">

        <h3>
          Delivery Address
        </h3>

        {order.orderAddress ? (

          <div className="admin-order-address">

            {/* ADDRESS HEADER */}

            <div className="admin-address-top">

              <strong>
                {order.orderAddress
                  .addressType ||
                  "Delivery Address"}
              </strong>

              {order.orderAddress
                .isDefault && (
                <span>
                  Default
                </span>
              )}

            </div>

            {/* ADDRESS CONTENT */}

            <div className="admin-address-content">

              <p>
                <strong>
                  {order.orderAddress
                    .fullName ||
                    order.customerName}
                </strong>
              </p>

              <p>
                Mobile:{" "}
                {order.orderAddress.mobile ||
                  order.mobile ||
                  "N/A"}
              </p>

              {order.orderAddress
                .houseNo && (
                <p>
                  {order.orderAddress.houseNo}
                  {order.orderAddress
                    .addressLine1
                    ? `, ${order.orderAddress.addressLine1}`
                    : ""}
                </p>
              )}

              {!order.orderAddress
                .houseNo &&
                order.orderAddress
                  .addressLine1 && (
                  <p>
                    {
                      order.orderAddress
                        .addressLine1
                    }
                  </p>
                )}

              {order.orderAddress
                .addressLine2 && (
                <p>
                  {
                    order.orderAddress
                      .addressLine2
                  }
                </p>
              )}

              {order.orderAddress
                .landmark && (
                <p>
                  <strong>
                    Landmark:
                  </strong>{" "}
                  {
                    order.orderAddress
                      .landmark
                  }
                </p>
              )}

              {(order.orderAddress
                .city ||
                order.orderAddress
                  .state ||
                order.orderAddress
                  .pincode) && (
                <p>
                  {order.orderAddress
                    .city || ""}

                  {order.orderAddress
                    .city &&
                    order.orderAddress
                      .state
                    ? ", "
                    : ""}

                  {order.orderAddress
                    .state || ""}

                  {(order.orderAddress
                    .city ||
                    order.orderAddress
                      .state) &&
                    order.orderAddress
                      .pincode
                    ? " - "
                    : ""}

                  {order.orderAddress
                    .pincode || ""}
                </p>
              )}

              <p>
                {order.orderAddress
                  .country ||
                  "India"}
              </p>

            </div>

            {/* ======================================
                EXACT DELIVERY LOCATION
            ====================================== */}

            <div className="admin-delivery-location">

              <div className="admin-delivery-location-header">

                <h4>
                  📍 Exact Delivery Location
                </h4>

                {hasDeliveryCoordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${deliveryLatitude},${deliveryLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="open-map-btn"
                  >
                    Open in Google Maps
                  </a>
                )}

              </div>

              {hasDeliveryCoordinates ? (

                <>

                  <div className="admin-location-coordinates">

                    <div>

                      <strong>
                        Latitude
                      </strong>

                      <span>
                        {deliveryLatitude.toFixed(
                          6
                        )}
                      </span>

                    </div>

                    <div>

                      <strong>
                        Longitude
                      </strong>

                      <span>
                        {deliveryLongitude.toFixed(
                          6
                        )}
                      </span>

                    </div>

                  </div>

                  <div className="admin-delivery-map">

                    <MapContainer
                      center={[
                        deliveryLatitude,
                        deliveryLongitude,
                      ]}
                      zoom={17}
                      scrollWheelZoom={true}
                      style={{
                        width: "100%",
                        height: "400px",
                      }}
                    >

                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <Marker
                        position={[
                          deliveryLatitude,
                          deliveryLongitude,
                        ]}
                      >

                        <Popup>

                          <div>

                            <strong>
                              Delivery Location
                            </strong>

                            <br />

                            {order.orderAddress
                              .fullName ||
                              order.customerName}

                            <br />

                            {order.orderAddress
                              .mobile ||
                              order.mobile}

                            <br />

                            {order.orderAddress
                              .city || ""}

                            {order.orderAddress
                              .state
                              ? `, ${order.orderAddress.state}`
                              : ""}

                          </div>

                        </Popup>

                      </Marker>

                    </MapContainer>

                  </div>

                </>

              ) : (

                <div className="admin-no-location">

                  📍 Exact map location was
                  not saved for this order.

                  <br />

                  <small>
                    This can happen with older
                    orders created before delivery
                    coordinates were enabled.
                  </small>

                </div>

              )}

            </div>

          </div>

        ) : (

          <div className="admin-no-address">

            No order address snapshot is
            available for this order.

          </div>

        )}

      </div>

      {/* ==========================================
          PAYMENT + ORDER TOTAL
      ========================================== */}

      <div className="order-card">

        <h3>
          Payment Details
        </h3>

        <div className="order-basic-info">

          <p>
            <strong>
              Payment Method:
            </strong>{" "}
            {order.paymentMethod}
          </p>

          <p>
            <strong>
              Payment Status:
            </strong>{" "}
            {order.paymentStatus}
          </p>

          <p>
            <strong>
              Total Amount:
            </strong>{" "}
            ₹
            {formatPrice(
              order.totalCost
            )}
          </p>

          {order.remarks && (
            <p>
              <strong>
                Remarks:
              </strong>{" "}
              {order.remarks}
            </p>
          )}

        </div>

      </div>

      {/* ==========================================
          STATUS
      ========================================== */}

      <div className="order-card">

        <h3>
          Order Status
        </h3>

        <div className="order-status-control">

          <select
            value={order.status}
            onChange={(e) =>
              setOrder({
                ...order,
                status: e.target.value,
              })
            }
          >

            {[
              "Pending",
              "Processing",
              "Shipped",
              "Delivered",
              "Cancelled",
            ].map((status) => (

              <option
                key={status}
                value={status}
              >
                {status}
              </option>

            ))}

          </select>

          <button
            className="save-btn"
            onClick={handleSaveStatus}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Status"}
          </button>

        </div>

      </div>

      {/* ==========================================
          ORDER ITEMS
      ========================================== */}

      <div className="order-card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() =>
            setShowItems(!showItems)
          }
        >

          <h3>
            Order Items
          </h3>

          <span>
            {showItems ? "−" : "+"}
          </span>

        </div>

        {showItems && (

          <>
            {order.items.length > 0 ? (

              <div className="order-items-table-wrapper">

                <table className="order-items-table">

                  <thead>

                    <tr>

                      <th>
                        Product
                      </th>

                      <th>
                        Description
                      </th>

                      <th>
                        Qty
                      </th>

                      <th>
                        Unit Price
                      </th>

                      <th>
                        Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {order.items.map(
                      (item, idx) => {

                        const quantity =
                          Number(
                            item.quantity || 1
                          );

                        const amount =
                          Number(
                            item.amount || 0
                          );

                        const unitPrice =
                          quantity > 0
                            ? amount /
                              quantity
                            : amount;

                        const image =
                          item.productImages?.[0];

                        const imageUrl =
                          image
                            ? /^https?:\/\//i.test(
                                image
                              )
                              ? image
                              : `${ASSET_BASE_URL}${
                                  image.startsWith(
                                    "/"
                                  )
                                    ? ""
                                    : "/"
                                }${image}`
                            : null;

                        return (
                          <tr
                            key={
                              item.id ||
                              idx
                            }
                          >

                            <td>

                              <div className="admin-order-product">

                                {imageUrl && (
                                  <img
                                    src={imageUrl}
                                    alt={
                                      item.productTitle ||
                                      "Product"
                                    }
                                  />
                                )}

                                <strong>
                                  {item.productTitle ||
                                    "-"}
                                </strong>

                              </div>

                            </td>

                            <td>
                              {item.description ||
                                "-"}
                            </td>

                            <td>
                              {quantity}
                            </td>

                            <td>
                              ₹
                              {formatPrice(
                                unitPrice
                              )}
                            </td>

                            <td>
                              ₹
                              {formatPrice(
                                amount
                              )}
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                  <tfoot>

                    <tr>

                      <td
                        colSpan="4"
                        style={{
                          textAlign:
                            "right",
                          fontWeight:
                            "700",
                        }}
                      >
                        Order Total
                      </td>

                      <td
                        style={{
                          fontWeight:
                            "700",
                        }}
                      >
                        ₹
                        {formatPrice(
                          order.totalCost
                        )}
                      </td>

                    </tr>

                  </tfoot>

                </table>

              </div>

            ) : (

              <p>
                No items found for this
                order.
              </p>

            )}

          </>

        )}

      </div>

      {/* ==========================================
          ORDER LOGS
      ========================================== */}

      {order.logs.length > 0 && (

        <div className="order-card collapsible-card">

          <div
            className="collapsible-header"
            onClick={() =>
              setShowLogs(!showLogs)
            }
          >

            <h3>
              Order Logs
            </h3>

            <span>
              {showLogs ? "−" : "+"}
            </span>

          </div>

          {showLogs && (

            <>

              <ul className="order-logs">

                {order.logs.map(
                  (log, idx) => (

                    <li key={idx}>

                      <span>
                        {log.message}
                      </span>

                      <span>
                        {log.date
                          ? new Date(
                              log.date
                            ).toLocaleString(
                              "en-IN"
                            )
                          : "N/A"}
                      </span>

                    </li>

                  )
                )}

              </ul>

              <button className="load-more-btn">
                Load more
              </button>

            </>

          )}

        </div>

      )}

    </main>
  );
};
