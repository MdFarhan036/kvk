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
  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [billingInfo, setBillingInfo] = useState({
    fname: "",
    lname: "",
    mobile: "",
    email: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    additionalInfo: "",
  });

  /* =========================================================
     BILLING HANDLER
  ========================================================= */

  const handleBillingChange = (e) => {
    const { name, value } = e.target;

    setBillingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     CALCULATE TOTAL
  ========================================================= */

  const totalCost = cartItems.reduce(
    (acc, item) =>
      acc +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  /* =========================================================
     IMAGE URL HELPER
  ========================================================= */

  const getImageUrl = (item) => {
    const image =
      item.images?.length > 0
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
     PLACE ORDER
  ========================================================= */

  const handlePlaceOrder = async () => {
    if (!customerId) {
      alert("Please login first");
      return;
    }

    if (
      !billingInfo.fname ||
      !billingInfo.lname ||
      !billingInfo.address
    ) {
      alert(
        "Please fill required billing details"
      );
      return;
    }

    if (!cartItems.length) {
      alert("Your cart is empty");
      return;
    }

    try {
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        description: item.title,
        amount:
          Number(item.price || 0) *
          Number(item.quantity || 0),
      }));

      const payload = {
        customerId,
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

      const res = await api.post(
        "/orders",
        payload
      );

      const newOrderId =
        res.data.orderId;

      setOrderId(newOrderId);

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

      alert(
        "Order placement failed. Please try again."
      );
    }
  };

  /* =========================================================
     LOAD CUSTOMER BILLING DETAILS
  ========================================================= */

  useEffect(() => {
    if (!customer) {
      return;
    }

    const nameParts = String(
      customer.name || ""
    )
      .trim()
      .split(/\s+/);

    setBillingInfo((prev) => ({
      ...prev,
      fname: nameParts[0] || "",
      lname: nameParts.slice(1).join(" ") || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      address: customer.address || "",
      state: customer.state || "",
      city: customer.city || "",
      pincode: customer.pincode || "",
    }));
  }, [customer]);

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="checkout-container">

      <h1>Checkout</h1>

      <div className="checkout-row">

        {/* ===================================================
            BILLING DETAILS
        =================================================== */}

        <div className="col-lg-7">

          <h4>Billing Details</h4>

          {[
            "fname",
            "lname",
            "mobile",
            "email",
            "address",
            "state",
            "city",
            "pincode",
            "additionalInfo",
          ].map((field) => (
            <input
              key={field}
              name={field}
              value={
                billingInfo[field] || ""
              }
              onChange={
                handleBillingChange
              }
              placeholder={
                field.toUpperCase()
              }
            />
          ))}

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
              India
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
          >
            Place Order
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