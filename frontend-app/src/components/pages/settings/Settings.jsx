import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../api.js";

import "./Settings.css";

export const Settings = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");

  // =========================================================
  // TAB HANDLER
  // =========================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      // Use the centralized API instance.
      // If your backend has a logout endpoint, add it here.
      //
      // await api.post("/auth/logout");

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  // =========================================================
  // ACCOUNT FORM
  // =========================================================

  const handleAccountSubmit = async (e) => {
    e.preventDefault();

    try {
      /*
       * Keep the API instance ready for the real account
       * update endpoint.
       *
       * Example:
       * await api.put("/customers/me", formData);
       */

      console.log("Account details submitted.");
    } catch (error) {
      console.error(
        "Failed to update account details:",
        error
      );
    }
  };

  // =========================================================
  // TRACK ORDER
  // =========================================================

  const handleTrackOrder = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const orderId = formData
      .get("order-id")
      ?.toString()
      .trim();

    const billingEmail = formData
      .get("billing-email")
      ?.toString()
      .trim();

    if (!orderId || !billingEmail) {
      alert(
        "Please enter your Order ID and billing email."
      );
      return;
    }

    try {
      /*
       * Connect your actual tracking endpoint here.
       *
       * Example:
       * const { data } = await api.get(
       *   `/orders/track/${encodeURIComponent(orderId)}`,
       *   {
       *     params: {
       *       email: billingEmail,
       *     },
       *   }
       * );
       */

      console.log("Track order:", {
        orderId,
        billingEmail,
      });
    } catch (error) {
      console.error(
        "Failed to track order:",
        error
      );
    }
  };

  return (
    <>
      <div className="settings-content">
        <div className="settings-container">

          <div className="settings-row">

            {/* =================================================
                ACCOUNT MENU
            ================================================= */}

            <div className="dashboard-menu">

              <ul role="tablist">

                {/* Dashboard */}

                <li className="dashboard-item">
                  <button
                    type="button"
                    className={`dashboard-link ${
                      activeTab === "dashboard"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleTabChange("dashboard")
                    }
                    id="dashboard-tab"
                    role="tab"
                    aria-selected={
                      activeTab === "dashboard"
                    }
                    aria-controls="dashboard-panel"
                  >
                    <i className="fa-solid fa-sliders mr-10"></i>
                    Dashboard
                  </button>
                </li>

                {/* Orders */}

                <li className="dashboard-item">
                  <button
                    type="button"
                    className={`dashboard-link ${
                      activeTab === "orders"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleTabChange("orders")
                    }
                    id="orders-tab"
                    role="tab"
                    aria-selected={
                      activeTab === "orders"
                    }
                    aria-controls="orders-panel"
                  >
                    <i className="fa-solid fa-sliders mr-10"></i>
                    Orders
                  </button>
                </li>

                {/* Track Orders */}

                <li className="dashboard-item">
                  <button
                    type="button"
                    className={`dashboard-link ${
                      activeTab === "track-orders"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleTabChange("track-orders")
                    }
                    id="track-orders-tab"
                    role="tab"
                    aria-selected={
                      activeTab === "track-orders"
                    }
                    aria-controls="track-orders-panel"
                  >
                    <i className="fa-solid fa-cart-shopping mr-10"></i>
                    Track Your Order
                  </button>
                </li>

                {/* Address */}

                <li className="dashboard-item">
                  <button
                    type="button"
                    className={`dashboard-link ${
                      activeTab === "address"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleTabChange("address")
                    }
                    id="address-tab"
                    role="tab"
                    aria-selected={
                      activeTab === "address"
                    }
                    aria-controls="address-panel"
                  >
                    <i className="fa-solid fa-location-dot mr-10"></i>
                    My Address
                  </button>
                </li>

                {/* Account Details */}

                <li className="dashboard-item">
                  <button
                    type="button"
                    className={`dashboard-link ${
                      activeTab === "account-detail"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleTabChange(
                        "account-detail"
                      )
                    }
                    id="account-detail-tab"
                    role="tab"
                    aria-selected={
                      activeTab === "account-detail"
                    }
                    aria-controls="account-detail-panel"
                  >
                    <i className="fa-solid fa-user mr-10"></i>
                    Account details
                  </button>
                </li>

                {/* Logout */}

                <li className="dashboard-item">
                  <button
                    type="button"
                    className="dashboard-link"
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-right-from-bracket mr-10"></i>
                    Logout
                  </button>
                </li>

              </ul>
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="dashboard-content account dashboard-content pl-50">

              {/* =================================================
                  DASHBOARD
              ================================================= */}

              {activeTab === "dashboard" && (
                <div
                  className="dashboard-pane fade active show"
                  id="dashboard-panel"
                  role="tabpanel"
                  aria-labelledby="dashboard-tab"
                >
                  <div className="settings-card">

                    <div className="settings-card-header">
                      <h3 className="mb-0">
                        Hello Rosie!
                      </h3>
                    </div>

                    <div className="settings-card-body">

                      <p>
                        From your account dashboard,
                        you can easily check &amp; view
                        your{" "}
                        <button
                          type="button"
                          className="settings-inline-link"
                          onClick={() =>
                            handleTabChange("orders")
                          }
                        >
                          recent orders
                        </button>
                        ,
                        <br />
                        manage your{" "}
                        <button
                          type="button"
                          className="settings-inline-link"
                          onClick={() =>
                            handleTabChange("address")
                          }
                        >
                          shipping and billing
                          addresses
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="settings-inline-link"
                          onClick={() =>
                            handleTabChange(
                              "account-detail"
                            )
                          }
                        >
                          edit your password and
                          account details.
                        </button>
                      </p>

                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  ORDERS
              ================================================= */}

              {activeTab === "orders" && (
                <div
                  className="dashboard-pane fade"
                  id="orders-panel"
                  role="tabpanel"
                  aria-labelledby="orders-tab"
                >
                  <div className="settings-card">

                    <div className="settings-card-header">
                      <h3 className="mb-0">
                        Your Orders
                      </h3>
                    </div>

                    <div className="settings-settings-card-body">

                      <div className="table-responsive">

                        <table className="table">

                          <thead>
                            <tr>
                              <th>Order</th>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Total</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>

                            <tr>
                              <td>#1357</td>
                              <td>March 45, 2020</td>
                              <td>Processing</td>
                              <td>
                                $125.00 for 2 item
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-small d-block"
                                >
                                  View
                                </button>
                              </td>
                            </tr>

                            <tr>
                              <td>#2468</td>
                              <td>June 29, 2020</td>
                              <td>Completed</td>
                              <td>
                                $364.00 for 5 item
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-small d-block"
                                >
                                  View
                                </button>
                              </td>
                            </tr>

                            <tr>
                              <td>#2366</td>
                              <td>August 02, 2020</td>
                              <td>Completed</td>
                              <td>
                                $280.00 for 3 item
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-small d-block"
                                >
                                  View
                                </button>
                              </td>
                            </tr>

                          </tbody>

                        </table>

                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  TRACK ORDERS
              ================================================= */}

              {activeTab === "track-orders" && (
                <div
                  className="dashboard-pane fade"
                  id="track-orders-panel"
                  role="tabpanel"
                  aria-labelledby="track-orders-tab"
                >
                  <div className="settings-card">

                    <div className="settings-card-header">
                      <h3 className="mb-0">
                        Orders tracking
                      </h3>
                    </div>

                    <div className="settings-card-body contact-from-area">

                      <p>
                        To track your order please enter
                        your OrderID in the box below and
                        press &quot;Track&quot; button. This was
                        given to you on your receipt and
                        in the confirmation email you
                        should have received.
                      </p>

                      <div className="settings-card-body-form">

                        <form
                          className="contact-form-style mt-30 mb-50"
                          onSubmit={handleTrackOrder}
                        >

                          <div className="contact-form-input-style">

                            <label>
                              Order ID
                            </label>

                            <input
                              name="order-id"
                              placeholder="Found in your order confirmation email"
                              type="text"
                            />

                          </div>

                          <div className="contact-form-input-style">

                            <label>
                              Billing email
                            </label>

                            <input
                              name="billing-email"
                              placeholder="Email you used during checkout"
                              type="email"
                            />

                          </div>

                          <button
                            className="submit submit-auto-width"
                            type="submit"
                          >
                            Track
                          </button>

                        </form>

                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  ADDRESS
              ================================================= */}

              {activeTab === "address" && (
                <div
                  className="dashboard-pane fade"
                  id="address-panel"
                  role="tabpanel"
                  aria-labelledby="address-tab"
                >

                  <div className="settings-address-card">

                    {/* Billing Address */}

                    <div className="settings-card">

                      <div className="settings-card-header">
                        <h3 className="mb-0">
                          Billing Address
                        </h3>
                      </div>

                      <div className="settings-card-body">

                        <address>
                          3522 Interstate
                          <br />
                          75 Business Spur,
                          <br />
                          Sault Ste.
                          <br />
                          Marie, MI 49783
                        </address>

                        <p>
                          New York
                        </p>

                        <button
                          type="button"
                          className="btn-small"
                        >
                          Edit
                        </button>

                      </div>

                    </div>

                    {/* Shipping Address */}

                    <div className="settings-card">

                      <div className="settings-card-header">
                        <h3 className="mb-0">
                          Shipping Address
                        </h3>
                      </div>

                      <div className="settings-card-body">

                        <address>
                          4299 Express Lane
                          <br />
                          Sarasota,
                          <br />
                          FL 34249 USA
                          <br />
                          Phone: 1.941.227.4444
                        </address>

                        <p>
                          Sarasota
                        </p>

                        <button
                          type="button"
                          className="btn-small"
                        >
                          Edit
                        </button>

                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  ACCOUNT DETAILS
              ================================================= */}

              {activeTab === "account-detail" && (
                <div
                  className="dashboard-pane fade"
                  id="account-detail-panel"
                  role="tabpanel"
                  aria-labelledby="account-detail-tab"
                >

                  <div className="settings-card">

                    <div className="settings-card-header">
                      <h5>
                        Account Details
                      </h5>
                    </div>

                    <div className="settings-card-body">

                      <p>
                        Already have an account?{" "}
                        <Link to="/login">
                          Log in instead!
                        </Link>
                      </p>

                      <form
                        method="post"
                        name="enq"
                        onSubmit={handleAccountSubmit}
                      >

                        <div className="row">

                          {/* First Name */}

                          <div className="form-group col-md-6">

                            <label>
                              First Name{" "}
                              <span className="required">
                                *
                              </span>
                            </label>

                            <input
                              required
                              className="form-control"
                              name="name"
                              type="text"
                            />

                          </div>

                          {/* Last Name */}

                          <div className="form-group col-md-6">

                            <label>
                              Last Name{" "}
                              <span className="required">
                                *
                              </span>
                            </label>

                            <input
                              required
                              className="form-control"
                              name="phone"
                              type="text"
                            />

                          </div>

                          {/* Display Name */}

                          <div className="form-group col-md-12">

                            <label>
                              Display Name{" "}
                              <span className="required">
                                *
                              </span>
                            </label>

                            <input
                              required
                              className="form-control"
                              name="dname"
                              type="text"
                            />

                          </div>

                          {/* Email */}

                          <div className="form-group col-md-12">

                            <label>
                              Email Address{" "}
                              <span className="required">
                                *
                              </span>
                            </label>

                            <input
                              required
                              className="form-control"
                              name="email"
                              type="email"
                            />

                          </div>

                          {/* Current Password */}

                          <div className="form-group col-md-12">

                            <label>
                              Current Password{" "}
                              <span className="required">
                                *
                              </span>
                            </label>

                            <input
                              required
                              className="form-control"
                              name="password"
                              type="password"
                            />

                          </div>

                          {/* New Password */}

                          <div className="form-group col-md-12">

                            <label>
                              New Password{" "}
                              <span className="required">
                                *
                              </span>
                            </label>

                            <input
                              required
                              className="form-control"
                              name="npassword"
                              type="password"
                            />

                          </div>

                          {/* Confirm Password */}

                          <div className="form-group col-md-12">

                            <label>
                              Confirm Password{" "}
                              <span className="required">
                                *
                              </span>
                            </label>

                            <input
                              required
                              className="form-control"
                              name="cpassword"
                              type="password"
                            />

                          </div>

                          {/* Save */}

                          <div className="col-md-12">

                            <button
                              type="submit"
                              className="btn btn-fill-out submit font-weight-bold"
                            >
                              Save Change
                            </button>

                          </div>

                        </div>

                      </form>

                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};