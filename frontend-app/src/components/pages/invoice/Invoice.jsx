import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import ishoplogo from "../../../assets/img/kvklogo1.png";
import "./Invoice.css";

export const Invoice = ({ order: orderProp }) => {
  const location = useLocation();

  // =====================================================
  // ORDER DATA
  // =====================================================

  const order =
    orderProp ||
    location.state?.order ||
    null;

  // =====================================================
  // SAFE HELPERS
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getOrderId = () =>
    order?.orderNumber ||
    order?.order_no ||
    order?.orderNumber ||
    order?.id ||
    "—";

  // =====================================================
  // CUSTOMER
  // =====================================================

  const customer = order?.customer || {};

  const customerName =
    order?.customer_name ||
    order?.customerName ||
    customer?.name ||
    [
      customer?.first_name,
      customer?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Customer";

  const customerEmail =
    order?.customer_email ||
    order?.customerEmail ||
    customer?.email ||
    "—";

  const customerPhone =
    order?.customer_phone ||
    order?.customerPhone ||
    customer?.phone ||
    customer?.mobile ||
    "";

  // =====================================================
  // BILLING ADDRESS
  // =====================================================

  const billing =
    order?.billingAddress ||
    order?.billing_address ||
    order?.billing ||
    {};

  const shipping =
    order?.shippingAddress ||
    order?.shipping_address ||
    order?.shipping ||
    {};

  const address =
    billing?.address ||
    shipping?.address ||
    order?.address ||
    "";

  const city =
    billing?.city ||
    shipping?.city ||
    order?.city ||
    "";

  const state =
    billing?.state ||
    shipping?.state ||
    order?.state ||
    "";

  const pincode =
    billing?.pincode ||
    billing?.postal_code ||
    shipping?.pincode ||
    shipping?.postal_code ||
    order?.pincode ||
    order?.zip ||
    "";

  // =====================================================
  // PAYMENT
  // =====================================================

  const paymentMethod =
    order?.paymentMethod ||
    order?.payment_method ||
    "—";

  const paymentStatus =
    order?.paymentStatus ||
    order?.payment_status ||
    "";

  // =====================================================
  // ORDER DATE
  // =====================================================

  const orderDate =
    order?.createdAt ||
    order?.created_at ||
    order?.orderDate ||
    order?.order_date ||
    null;

  // =====================================================
  // ORDER ITEMS
  // =====================================================

  const items = useMemo(() => {
    const orderItems =
      order?.items ||
      order?.orderItems ||
      order?.order_items ||
      [];

    return Array.isArray(orderItems)
      ? orderItems
      : [];
  }, [order]);

  // =====================================================
  // ITEM TOTAL
  // =====================================================

  const getItemPrice = (item) => {
    return Number(
      item?.price ??
        item?.unit_price ??
        item?.selling_price ??
        item?.product_price ??
        0
    );
  };

  const getItemQuantity = (item) => {
    return Number(
      item?.quantity ??
        item?.qty ??
        1
    );
  };

  const getItemTotal = (item) => {
    const explicitTotal =
      item?.total ??
      item?.item_total ??
      item?.subtotal;

    if (
      explicitTotal !== undefined &&
      explicitTotal !== null
    ) {
      return Number(explicitTotal || 0);
    }

    return (
      getItemPrice(item) *
      getItemQuantity(item)
    );
  };

  // =====================================================
  // CALCULATE SUBTOTAL
  // =====================================================

  const calculatedSubtotal = items.reduce(
    (sum, item) =>
      sum + getItemTotal(item),
    0
  );

  const subtotal = Number(
    order?.subtotal ??
      order?.subTotal ??
      order?.sub_total ??
      calculatedSubtotal
  );

  // =====================================================
  // TAX
  // =====================================================

  const tax = Number(
    order?.tax ??
      order?.taxAmount ??
      order?.tax_amount ??
      0
  );

  // =====================================================
  // SHIPPING
  // =====================================================

  const shippingCost = Number(
    order?.shippingCost ??
      order?.shipping_cost ??
      order?.deliveryCharge ??
      order?.delivery_charge ??
      0
  );

  // =====================================================
  // DISCOUNT
  // =====================================================

  const discount = Number(
    order?.discount ??
      order?.discountAmount ??
      order?.discount_amount ??
      0
  );

  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const calculatedGrandTotal =
    subtotal +
    tax +
    shippingCost -
    discount;

  const grandTotal = Number(
    order?.totalCost ??
      order?.total_cost ??
      order?.grandTotal ??
      order?.grand_total ??
      order?.total ??
      calculatedGrandTotal
  );

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="invoice-container">

      <div className="invoice-row">

        <div className="col-lg-12">

          <div className="invoice-inner">

            {/* =================================================
                INVOICE
            ================================================= */}

            <div
              className="invoice-info"
              id="invoice_wrapper"
            >

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="invoice-header">

                <div className="row">

                  <div className="col-sm-6">

                    <div className="invoice-name">

                      <div className="invoice-logo">

                        <img
                          src={ishoplogo}
                          alt="KVK"
                        />

                      </div>

                    </div>

                  </div>

                  <div className="col-sm-6">

                    <div className="invoice-numb">

                      <h6 className="text-end mb-10 mt-20">
                        Date:{" "}
                        {formatDate(orderDate)}
                      </h6>

                      <h6 className="text-end invoice-header-1">
                        Invoice No: #
                        {getOrderId()}
                      </h6>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  CUSTOMER / BILLING
              ================================================= */}

              <div className="invoice-top">

                <div className="invoice-top-row">

                  <div className="col-lg-9 col-md-6">

                    <div className="invoice-number">

                      <h4 className="invoice-title-1 mb-10">
                        Invoice To
                      </h4>

                      <p className="invoice-addr-1">

                        <strong>
                          {customerName}
                        </strong>

                        <br />

                        {customerEmail}

                        {customerPhone && (
                          <>
                            <br />
                            {customerPhone}
                          </>
                        )}

                        {address && (
                          <>
                            <br />
                            {address}
                          </>
                        )}

                        {(city ||
                          state ||
                          pincode) && (
                          <>
                            <br />

                            {[
                              city,
                              state,
                              pincode,
                            ]
                              .filter(Boolean)
                              .join(
                                ", "
                              )}
                          </>
                        )}

                      </p>

                    </div>

                  </div>

                  <div className="col-lg-3 col-md-6">

                    <div className="invoice-number">

                      <h4 className="invoice-title-1 mb-10">
                        Bill To
                      </h4>

                      <p className="invoice-addr-1">

                        <strong>
                          {customerName}
                        </strong>

                        <br />

                        {customerEmail}

                        {address && (
                          <>
                            <br />
                            {address}
                          </>
                        )}

                        {(city ||
                          state ||
                          pincode) && (
                          <>
                            <br />

                            {[
                              city,
                              state,
                              pincode,
                            ]
                              .filter(Boolean)
                              .join(
                                ", "
                              )}
                          </>
                        )}

                      </p>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    DATE / PAYMENT
                ================================================= */}

                <div className="row mt-2">

                  <div className="col-lg-9 col-md-6">

                    <h4 className="invoice-title-1 mb-10">
                      Order Date:
                    </h4>

                    <p className="invoice-from-1">
                      {formatDate(
                        orderDate
                      )}
                    </p>

                  </div>

                  <div className="col-lg-3 col-md-6">

                    <h4 className="invoice-title-1 mb-10">
                      Payment Method
                    </h4>

                    <p className="invoice-from-1">
                      {paymentMethod}

                      {paymentStatus && (
                        <>
                          {" "}
                          ({paymentStatus})
                        </>
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  ITEMS
              ================================================= */}

              <div className="invoice-center">

                <div className="table-responsive">

                  <table className="table table-striped invoice-table">

                    <thead className="bg-active">

                      <tr>

                        <th>
                          Item Name
                        </th>

                        <th className="text-center">
                          Unit Price
                        </th>

                        <th className="text-center">
                          Quantity
                        </th>

                        <th className="text-right">
                          Amount
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {items.length > 0 ? (
                        items.map(
                          (item, index) => {

                            const itemName =
                              item?.title ||
                              item?.name ||
                              item?.product_name ||
                              item?.product?.title ||
                              item?.product?.name ||
                              "Product";

                            const sku =
                              item?.sku ||
                              item?.product_sku ||
                              item?.product?.sku ||
                              "";

                            const price =
                              getItemPrice(
                                item
                              );

                            const quantity =
                              getItemQuantity(
                                item
                              );

                            const total =
                              getItemTotal(
                                item
                              );

                            return (
                              <tr
                                key={
                                  item?.id ||
                                  item?.product_id ||
                                  index
                                }
                              >

                                <td>

                                  <div className="item-desc-1">

                                    <span>
                                      {itemName}
                                    </span>

                                    {sku && (
                                      <small>
                                        SKU:{" "}
                                        {sku}
                                      </small>
                                    )}

                                  </div>

                                </td>

                                <td className="text-center">
                                  {formatPrice(
                                    price
                                  )}
                                </td>

                                <td className="text-center">
                                  {quantity}
                                </td>

                                <td className="text-right">
                                  {formatPrice(
                                    total
                                  )}
                                </td>

                              </tr>
                            );
                          }
                        )
                      ) : (
                        <tr>

                          <td
                            colSpan="4"
                            className="text-center"
                          >
                            No order items found.
                          </td>

                        </tr>
                      )}

                      {/* =================================================
                          SUBTOTAL
                      ================================================= */}

                      <tr>

                        <td
                          colSpan="3"
                          className="text-end f-w-600"
                        >
                          SubTotal
                        </td>

                        <td className="text-right">
                          {formatPrice(
                            subtotal
                          )}
                        </td>

                      </tr>

                      {/* =================================================
                          DISCOUNT
                      ================================================= */}

                      {discount > 0 && (
                        <tr>

                          <td
                            colSpan="3"
                            className="text-end f-w-600"
                          >
                            Discount
                          </td>

                          <td className="text-right">
                            -{" "}
                            {formatPrice(
                              discount
                            )}
                          </td>

                        </tr>
                      )}

                      {/* =================================================
                          TAX
                      ================================================= */}

                      {tax > 0 && (
                        <tr>

                          <td
                            colSpan="3"
                            className="text-end f-w-600"
                          >
                            Tax
                          </td>

                          <td className="text-right">
                            {formatPrice(
                              tax
                            )}
                          </td>

                        </tr>
                      )}

                      {/* =================================================
                          SHIPPING
                      ================================================= */}

                      {shippingCost > 0 && (
                        <tr>

                          <td
                            colSpan="3"
                            className="text-end f-w-600"
                          >
                            Shipping
                          </td>

                          <td className="text-right">
                            {formatPrice(
                              shippingCost
                            )}
                          </td>

                        </tr>
                      )}

                      {/* =================================================
                          GRAND TOTAL
                      ================================================= */}

                      <tr>

                        <td
                          colSpan="3"
                          className="text-end f-w-600"
                        >
                          Grand Total
                        </td>

                        <td className="text-right f-w-600">
                          {formatPrice(
                            grandTotal
                          )}
                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>

              {/* =================================================
                  BOTTOM
              ================================================= */}

              <div className="invoice-bottom">

                <div className="row">

                  <div className="col-sm-6">

                    <div>

                      <h3 className="invoice-title-1">
                        Important Note
                      </h3>

                      <ul className="important-notes-list-1">

                        <li>
                          All amounts shown on
                          this invoice are in
                          Indian Rupees.
                        </li>

                        <li>
                          Please retain this
                          invoice for your
                          records.
                        </li>

                        <li>
                          Once an order is
                          processed, refund
                          eligibility is subject
                          to the applicable
                          refund policy.
                        </li>

                        <li>
                          Delivery may be delayed
                          due to external
                          circumstances.
                        </li>

                      </ul>

                    </div>

                  </div>

                  <div className="col-sm-6 col-offsite">

                    <div className="text-end">

                      <p className="mb-0 text-13">
                        Thank you for your
                        business
                      </p>

                      <p>
                        <strong>
                          KVK
                        </strong>
                      </p>

                      <div className="mobile-social-icon mt-50 print-hide">

                        <h6>
                          Follow Us
                        </h6>

                        <a
                          href="#"
                          aria-label="Facebook"
                        >
                          <i className="fa-brands fa-facebook-f" />
                        </a>

                        <a
                          href="#"
                          aria-label="Twitter"
                        >
                          <i className="fa-brands fa-x-twitter" />
                        </a>

                        <a
                          href="#"
                          aria-label="Instagram"
                        >
                          <i className="fa-brands fa-instagram" />
                        </a>

                        <a
                          href="#"
                          aria-label="Pinterest"
                        >
                          <i className="fa-brands fa-pinterest-p" />
                        </a>

                        <a
                          href="#"
                          aria-label="YouTube"
                        >
                          <i className="fa-brands fa-youtube" />
                        </a>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="invoice-btn-section clearfix d-print-none">

              <button
                type="button"
                onClick={() =>
                  window.print()
                }
                className="btn btn-lg btn-custom btn-print hover-up"
              >
                <i className="fa-solid fa-print" />{" "}
                Print
              </button>

              <button
                type="button"
                onClick={
                  handleDownload
                }
                className="btn btn-lg btn-custom btn-download hover-up"
              >
                <i className="fa-solid fa-download" />{" "}
                Download
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};