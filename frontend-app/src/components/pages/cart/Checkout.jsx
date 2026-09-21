import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { ASSET_BASE_URL } from "../../api.js";

import { useCart } from "../../../context/CartContext";
import { useCustomerAuth } from "../../../context/CustomerContext";

import "./cart.css";

export const Checkout = () => {
  const navigate = useNavigate();

  const { cartItems, clearCart } = useCart();
  const { customer } = useCustomerAuth();

  const customerId = customer?.id;

  const [orderId, setOrderId] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // =========================================================
  // ADDRESS STATE
  // =========================================================

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // =========================================================
  // BILLING / ADDITIONAL INFO
  // =========================================================

  const [billingInfo, setBillingInfo] = useState({
    additionalInfo: "",
  });

  // =========================================================
  // LOAD SAVED ADDRESSES
  // =========================================================

  const fetchAddresses = async () => {
    if (!customerId) {
      setLoadingAddresses(false);
      return;
    }

    try {
      setLoadingAddresses(true);

      const res = await api.get("/customer/addresses");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.addresses || [];

      setAddresses(data);

      // -------------------------------------------------------
      // Automatically select default address
      // -------------------------------------------------------

      const defaultAddress = data.find(
        (address) =>
          Boolean(address.isDefault) === true ||
          address.isDefault === 1
      );

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data.length > 0) {
        // If no default exists, select first address
        setSelectedAddressId(data[0].id);
      } else {
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error(
        "❌ Error fetching checkout addresses:",
        error
      );

      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [customerId]);

  // =========================================================
  // BILLING HANDLER
  // =========================================================

  const handleBillingChange = (e) => {
    const { name, value } = e.target;

    setBillingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CALCULATE TOTAL
  // =========================================================

  const totalCost = cartItems.reduce(
    (acc, item) =>
      acc +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  // =========================================================
  // IMAGE URL HELPER
  // =========================================================

  const getImageUrl = (item) => {
    const image =
      item.images?.length > 0
        ? item.images[0]
        : item.image;

    if (!image) {
      return null;
    }

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${ASSET_BASE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  // =========================================================
  // GET SELECTED ADDRESS
  // =========================================================

  const selectedAddress = addresses.find(
    (address) =>
      Number(address.id) ===
      Number(selectedAddressId)
  );

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder = async () => {
    // -------------------------------------------------------
    // LOGIN CHECK
    // -------------------------------------------------------

    if (!customerId) {
      alert("Please login first");
      return;
    }

    // -------------------------------------------------------
    // CART CHECK
    // -------------------------------------------------------

    if (!cartItems.length) {
      alert("Your cart is empty");
      return;
    }

    // -------------------------------------------------------
    // ADDRESS CHECK
    // -------------------------------------------------------

    if (!selectedAddressId) {
      alert(
        "Please select a delivery address before placing your order."
      );
      return;
    }

    if (!selectedAddress) {
      alert(
        "Selected delivery address could not be found. Please select another address."
      );
      return;
    }

    try {
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        description: item.title || item.name || "",
        amount:
          Number(item.price || 0) *
          Number(item.quantity || 0),
      }));

      // -------------------------------------------------------
      // ORDER PAYLOAD
      // -------------------------------------------------------

      const payload = {
        customerId,

        // IMPORTANT:
        // Backend will use this address ID to fetch the
        // complete address and create an order snapshot.
        addressId: selectedAddressId,

        totalCost,

        status: "Pending",

        paymentMethod,

        paymentStatus:
          paymentMethod === "cod"
            ? "Unpaid"
            : "Paid",

        remarks:
          billingInfo.additionalInfo || "",

        items,
      };

      console.log(
        "📦 Placing order with address:",
        selectedAddressId
      );

      const res = await api.post(
        "/orders",
        payload
      );

      const newOrderId = res.data.orderId;

      setOrderId(newOrderId);

      // -------------------------------------------------------
      // CLEAR CART
      // -------------------------------------------------------

      clearCart();

      alert(
        `✅ Order placed successfully! Order ID: ${newOrderId}`
      );

      navigate("/trackmyorder", {
        state: {
          orderId: newOrderId,
        },
      });
    } catch (err) {
      console.error(
        "❌ Checkout failed:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Order placement failed. Please try again.";

      alert(message);
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="checkout-container">

      <h1>Checkout</h1>

      <div className="checkout-row">

        {/* ===================================================
            DELIVERY ADDRESS
        =================================================== */}

        <div className="col-lg-7">

          <h4>Delivery Address</h4>

          {loadingAddresses ? (
            <div className="checkout-address-loading">
              Loading saved addresses...
            </div>
          ) : addresses.length === 0 ? (

            <div className="checkout-no-address">

              <p>
                You don't have any saved delivery
                addresses.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/account/addresses")
                }
              >
                + Add Delivery Address
              </button>

            </div>

          ) : (

            <div className="checkout-address-list">

              {addresses.map((address) => {

                const isSelected =
                  Number(selectedAddressId) ===
                  Number(address.id);

                const isDefault =
                  Boolean(address.isDefault) === true ||
                  address.isDefault === 1;

                return (
                  <div
                    key={address.id}
                    className={`checkout-address-card ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedAddressId(
                        address.id
                      )
                    }
                  >

                    <div className="checkout-address-header">

                      <label
                        className="checkout-address-radio"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <input
                          type="radio"
                          name="checkoutAddress"
                          checked={isSelected}
                          onChange={() =>
                            setSelectedAddressId(
                              address.id
                            )
                          }
                        />

                        <strong>
                          {address.addressType ||
                            "Address"}
                        </strong>
                      </label>

                      {isDefault && (
                        <span className="checkout-default-badge">
                          Default
                        </span>
                      )}

                    </div>

                    <div className="checkout-address-details">

                      <strong>
                        {address.fullName}
                      </strong>

                      <span>
                        {address.mobile}
                      </span>

                      <p>
                        {address.houseNo}
                        {address.addressLine1
                          ? `, ${address.addressLine1}`
                          : ""}
                        {address.addressLine2
                          ? `, ${address.addressLine2}`
                          : ""}
                      </p>

                      {address.landmark && (
                        <p>
                          Landmark:{" "}
                          {address.landmark}
                        </p>
                      )}

                      <p>
                        {address.city},{" "}
                        {address.state} -{" "}
                        {address.pincode}
                      </p>

                      <p>
                        {address.country ||
                          "India"}
                      </p>

                    </div>

                    <button
                      type="button"
                      className="checkout-change-address"
                      onClick={(e) => {
                        e.stopPropagation();

                        navigate(
                          "/account/addresses"
                        );
                      }}
                    >
                      Manage Addresses
                    </button>

                  </div>
                );
              })}

            </div>
          )}

          {/* =================================================
              ADD ADDRESS
          ================================================= */}

          {addresses.length > 0 && (
            <button
              type="button"
              className="checkout-add-address"
              onClick={() =>
                navigate("/account/addresses")
              }
            >
              + Add / Manage Address
            </button>
          )}

          {/* =================================================
              ADDITIONAL INFORMATION
          ================================================= */}

          <div className="checkout-additional-info">

            <label htmlFor="additionalInfo">
              Additional Information
            </label>

            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={
                billingInfo.additionalInfo
              }
              onChange={handleBillingChange}
              placeholder="Order notes, delivery instructions, etc."
              rows={4}
            />

          </div>

        </div>

        {/* ===================================================
            ORDER SUMMARY
        =================================================== */}

        <div className="cart-summary">

          <h3>Your Order</h3>

          {cartItems.map((item) => {

            const imageUrl =
              getImageUrl(item);

            const price =
              Number(item.price || 0);

            const quantity =
              Number(item.quantity || 0);

            const subtotal =
              price * quantity;

            return (
              <div
                key={item.productId}
                className="summary-row"
              >

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
                      item.name}{" "}
                    × {quantity}
                  </span>

                </div>

                <span>
                  ₹{subtotal.toFixed(2)}
                </span>

              </div>
            );
          })}

          <div className="divider-2" />

          {/* SUBTOTAL */}

          <div className="summary-row">

            <span>
              Subtotal
            </span>

            <span>
              ₹{totalCost.toFixed(2)}
            </span>

          </div>

          {/* SHIPPING */}

          <div className="summary-row">

            <span>
              Shipping
            </span>

            <span className="free-text">
              Free
            </span>

          </div>

          {/* LOCATION */}

          <div className="summary-row">

            <span>
              Estimate For
            </span>

            <span>
              {selectedAddress?.city ||
                "India"}
            </span>

          </div>

          <div className="divider-2" />

          {/* TOTAL */}

          <div className="summary-total">

            <strong>
              Total
            </strong>

            <strong>
              ₹{totalCost.toFixed(2)}
            </strong>

          </div>

          {/* =================================================
              PAYMENT METHOD
          ================================================= */}

          <div
            style={{
              marginTop: "12px",
            }}
          >

            <label>

              <input
                type="radio"
                value="cod"
                checked={
                  paymentMethod === "cod"
                }
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value
                  )
                }
              />

              Cash on Delivery

            </label>

            <label
              style={{
                marginLeft: "12px",
              }}
            >

              <input
                type="radio"
                value="online"
                checked={
                  paymentMethod === "online"
                }
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value
                  )
                }
              />

              Online Payment

            </label>

          </div>

          {/* =================================================
              PLACE ORDER
          ================================================= */}

          <button
            className="btn-place-order"
            onClick={handlePlaceOrder}
            disabled={
              loadingAddresses ||
              addresses.length === 0 ||
              !selectedAddressId
            }
          >
            {loadingAddresses
              ? "Loading Address..."
              : addresses.length === 0
              ? "Add Address to Continue"
              : "Place Order"}
          </button>

        </div>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {orderId && (
        <div
          style={{
            marginTop: 20,
          }}
        >
          <h3>
            ✅ Order Placed Successfully
          </h3>

          <p>
            Order ID: {orderId}
          </p>
        </div>
      )}

    </div>
  );
};