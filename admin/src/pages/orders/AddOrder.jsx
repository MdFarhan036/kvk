import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

export const AddOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const prefillCustomerId = queryParams.get("customerId");

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    customerId: prefillCustomerId || "",
    totalCost: 0,
    status: "Pending",
    paymentMethod: "",
    paymentStatus: "Pending",
    remarks: "",
    items: [
      {
        productId: "",
        quantity: 1,
        description: "",
        amount: 0,
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // FETCH CUSTOMERS & PRODUCTS
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, productRes] =
          await Promise.all([
            api.get("/admin/customers"),
            api.get("/products"),
          ]);

        const customerData = Array.isArray(
          customerRes.data
        )
          ? customerRes.data
          : customerRes.data.customers || [];

        setCustomers(customerData);
        setProducts(productRes.data || []);
      } catch (err) {
        console.error(
          "❌ Failed to fetch dropdown data:",
          err
        );
      }
    };

    fetchData();
  }, []);

  // ============================================
  // COMMON FORM HANDLER
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================
  // PRODUCT & QUANTITY HANDLER
  // ============================================
  const handleItemChange = (idx, e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updatedItems = [...prev.items];

      if (name === "productId") {
        const selectedProduct = products.find(
          (p) => p.id === parseInt(value, 10)
        );

        const price = Number(
          selectedProduct?.price || 0
        );

        const qty = Number(
          updatedItems[idx].quantity || 1
        );

        updatedItems[idx] = {
          ...updatedItems[idx],
          productId: value,
          description:
            selectedProduct?.title || "",
          amount: price * qty,
        };
      }

      if (name === "quantity") {
        const qty = Number(value || 1);

        const currentProductId =
          updatedItems[idx].productId;

        const selectedProduct = products.find(
          (p) =>
            p.id ===
            parseInt(currentProductId, 10)
        );

        const price = Number(
          selectedProduct?.price || 0
        );

        updatedItems[idx] = {
          ...updatedItems[idx],
          quantity: qty,
          amount: price * qty,
        };
      }

      const updatedTotal =
        updatedItems.reduce(
          (sum, item) =>
            sum + Number(item.amount || 0),
          0
        );

      return {
        ...prev,
        items: updatedItems,
        totalCost: updatedTotal,
      };
    });
  };

  // ============================================
  // ADD ITEM
  // ============================================
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          quantity: 1,
          description: "",
          amount: 0,
        },
      ],
    }));
  };

  // ============================================
  // REMOVE ITEM
  // ============================================
  const removeItem = (idx) => {
    setForm((prev) => {
      const remainingItems = prev.items.filter(
        (_, i) => i !== idx
      );

      const updatedTotal =
        remainingItems.reduce(
          (sum, item) =>
            sum + Number(item.amount || 0),
          0
        );

      return {
        ...prev,
        items: remainingItems,
        totalCost: updatedTotal,
      };
    });
  };

  // ============================================
  // SUBMIT ORDER
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    // Customer validation
    if (!form.customerId) {
      setError("❌ Please select a customer");
      setLoading(false);
      return;
    }

    // Items validation
    if (!form.items.length) {
      setError(
        "❌ Please add at least one product"
      );
      setLoading(false);
      return;
    }

    // Individual item validation
    for (const item of form.items) {
      if (!parseInt(item.productId, 10)) {
        setError(
          "❌ Invalid product selected"
        );
        setLoading(false);
        return;
      }

      if (
        !item.quantity ||
        item.quantity <= 0
      ) {
        setError(
          "❌ Quantity must be at least 1"
        );
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        customerId: Number(
          form.customerId
        ),

        totalCost: Number(
          form.totalCost
        ),

        status: form.status,

        paymentMethod:
          form.paymentMethod || null,

        paymentStatus:
          form.paymentStatus || "Pending",

        remarks: form.remarks || "",

        items: form.items.map((item) => ({
          productId: Number(
            item.productId
          ),

          quantity: Number(
            item.quantity || 1
          ),

          description: item.description,

          amount: Number(
            item.amount
          ),
        })),
      };

      console.log(
        "✅ FINAL PAYLOAD SENDING:",
        payload
      );

      const res = await api.post(
        "/orders",
        payload
      );

      alert(
        res.data?.message ||
          "✅ Order created successfully!"
      );

      navigate(
        prefillCustomerId
          ? `/customers/customer/${prefillCustomerId}/orders`
          : "/allorders"
      );
    } catch (err) {
      console.error(
        "❌ SUBMIT ERROR FULL:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "❌ Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <main  className="add-order-container">
      <h2>Add Order</h2>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        {/* CUSTOMER */}
        <div>
          <label>Customer</label>

          <select
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            required
            disabled={!!prefillCustomerId}
          >
            <option value="">
              Select Customer
            </option>

            {customers.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.customerName} (ID: {c.id})
              </option>
            ))}
          </select>
        </div>

        {/* TOTAL COST */}
        <div>
          <label>Total Cost</label>

          <input
            type="number"
            value={form.totalCost}
            readOnly
          />
        </div>

        {/* STATUS */}
        <div>
          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
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
        </div>

        {/* PAYMENT METHOD */}
        <div>
          <label>Payment Method</label>

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="">
              Select
            </option>

            <option value="Cash">
              Cash
            </option>

            <option value="UPI">
              UPI
            </option>

            <option value="Card">
              Card
            </option>

            <option value="NetBanking">
              NetBanking
            </option>
          </select>
        </div>

        {/* PAYMENT STATUS */}
        <div>
          <label>Payment Status</label>

          <select
            name="paymentStatus"
            value={form.paymentStatus}
            onChange={handleChange}
          >
            <option value="Pending">
              Pending
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Failed">
              Failed
            </option>

            <option value="Refunded">
              Refunded
            </option>
          </select>
        </div>

        {/* REMARKS */}
        <div>
          <label>Remarks</label>

          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
          />
        </div>

        {/* ITEMS */}
        <h3>Items</h3>

        {form.items.map(
          (item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "6px",
              }}
            >

              {/* PRODUCT */}
              <select
                name="productId"
                value={item.productId}
                onChange={(e) =>
                  handleItemChange(
                    idx,
                    e
                  )
                }
                required
              >
                <option value="">
                  Select Product
                </option>

                {products.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.title} (₹
                    {p.price})
                  </option>
                ))}
              </select>

              {/* QUANTITY */}
              <input
                type="number"
                name="quantity"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(
                    idx,
                    e
                  )
                }
                style={{
                  width: "80px",
                }}
              />

              {/* DESCRIPTION */}
              <input
                type="text"
                value={
                  item.description
                }
                readOnly
                style={{
                  flex: 1,
                }}
              />

              {/* AMOUNT */}
              <input
                type="number"
                value={item.amount}
                readOnly
                style={{
                  width: "120px",
                }}
              />

              {/* REMOVE */}
              {form.items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeItem(idx)
                  }
                >
                  Remove
                </button>
              )}
            </div>
          )
        )}

        {/* ADD ITEM */}
        <button
          type="button"
          onClick={addItem}
        >
          + Add Item
        </button>

        <br />
        <br />

        {/* SAVE */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "Save Order"}
        </button>

      </form>
    </main>
  );
};