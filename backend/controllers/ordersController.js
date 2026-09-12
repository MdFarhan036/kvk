import { db } from "../db.js";

// ✅ Create a new order with items
export const addOrder = async (req, res) => {
  console.log("✅ FULL BODY RECEIVED:", req.body);

  const {
    customerId,
    totalCost,
    status,
    paymentMethod,
    paymentStatus,
    remarks,
    items,
  } = req.body;

  if (!customerId || totalCost === undefined || totalCost === null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // ✅ 1. INSERT ORDER (PROMISE BASED)
    const orderQuery = `
      INSERT INTO orders 
      (customerId, totalCost, status, paymentMethod, paymentStatus, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [orderResult] = await db.execute(orderQuery, [
      customerId,
      totalCost,
      status || "Pending",
      paymentMethod || null,
      paymentStatus || "Pending",
      remarks || "",
    ]);

    const orderId = orderResult.insertId;

    console.log("✅ ORDER CREATED WITH ID:", orderId);

    // ✅ 2. IF NO ITEMS → RETURN SUCCESS
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(201).json({
        message: "Order created successfully (no items)",
        orderId,
      });
    }

    // ✅ 3. INSERT ORDER ITEMS (PROMISE LOOP)
    const itemQuery = `
      INSERT INTO order_items 
      (orderId, product_id, quantity, description, amount)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const i of items) {
      console.log("➡️ INSERTING ITEM:", i);

      await db.execute(itemQuery, [
        orderId,
        Number(i.productId),
        Number(i.quantity || 1),
        i.description || "",
        Number(i.amount),
      ]);
    }

    console.log("✅✅ ALL ORDER ITEMS INSERTED SUCCESSFULLY");
    const invoiceNo = "INV-" + String(orderId).padStart(4, "0");

    await db.execute(
      `
      INSERT INTO transactions (orderId, invoice_no, amount, status)
      VALUES (?, ?, ?, ?)
      `,
      [orderId, invoiceNo, totalCost, paymentStatus || "PENDING"]
    );

    console.log("🧾 Transaction created for order", orderId);

    // ✅ 4. FINAL SUCCESS RESPONSE
    return res.status(201).json({
      message: "Order + Transaction created successfully",
      orderId,
    });
  } catch (err) {
    console.error("❌ ADD ORDER FAILED:", err);
    return res.status(500).json({
      message: "Failed to create order",
      error: err.sqlMessage || err.message || err,
    });
  }
};

// ✅ Get all orders with items
export const getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.*, 
        c.customerName, c.email, c.mobile
      FROM orders o
      LEFT JOIN customers c ON o.customerId = c.id
      ORDER BY o.orderDate DESC
    `);

    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map((o) => o.id);

    const [items] = await db.query(
      `
        SELECT 
          oi.*,
          p.title AS productTitle,
          p.price AS productPrice,
          p.images AS productImages
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.orderId IN (?)
      `,
      [orderIds]
    );

    const merged = orders.map((order) => {
      const orderItems = items
        .filter((item) => item.orderId === order.id)
        .map((item) => ({
          ...item,
          productImages: item.productImages
            ? JSON.parse(item.productImages)
            : [],
        }));

      return {
        ...order,
        items: orderItems,
      };
    });

    res.json(merged);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
// =====================================================
// GET LOGGED-IN CUSTOMER ORDERS
// =====================================================

export const getMyOrders = async (req, res) => {
  try {
    console.log("CUSTOMER AUTH DATA:", req.customer);

    // Adjust this based on your verifyCustomer middleware
    const customerId =
      req.customer?.id ||
      req.customer?.customerId ||
      req.user?.id ||
      req.user?.customerId;

    if (!customerId) {
      return res.status(401).json({
        message: "Customer authentication required",
      });
    }

    const [orders] = await db.query(
      `
      SELECT
        o.*,
        c.customerName,
        c.email,
        c.mobile
      FROM orders o
      LEFT JOIN customers c
        ON o.customerId = c.id
      WHERE o.customerId = ?
      ORDER BY o.orderDate DESC
      `,
      [customerId]
    );

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map((order) => order.id);

    const [items] = await db.query(
      `
      SELECT
        oi.*,
        p.title AS productTitle,
        p.price AS productPrice,
        p.images AS productImages
      FROM order_items oi
      LEFT JOIN products p
        ON oi.product_id = p.id
      WHERE oi.orderId IN (?)
      `,
      [orderIds]
    );

    const mergedOrders = orders.map((order) => {
      const orderItems = items
        .filter(
          (item) =>
            Number(item.orderId) === Number(order.id)
        )
        .map((item) => {
          let productImages = [];

          try {
            productImages = item.productImages
              ? JSON.parse(item.productImages)
              : [];
          } catch (error) {
            productImages = [];
          }

          return {
            ...item,
            productImages,
          };
        });

      return {
        ...order,
        items: orderItems,
      };
    });

    return res.json(mergedOrders);

  } catch (error) {
    console.error(
      "❌ Error fetching my orders:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch your orders",
    });
  }
};
// ✅ Get orders by customer ID
export const getOrdersByCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {
    const [orders] = await db.query(
      `
        SELECT o.*, c.customerName, c.email, c.mobile
        FROM orders o
        LEFT JOIN customers c ON o.customerId = c.id
        WHERE o.customerId = ?
        ORDER BY o.orderDate DESC
      `,
      [customerId]
    );

    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map((o) => o.id);

    const [items] = await db.query(
      `
        SELECT 
          oi.*,
          p.title AS productTitle,
          p.price AS productPrice,
          p.images AS productImages
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.orderId IN (?)
      `,
      [orderIds]
    );

    const merged = orders.map((order) => {
      const orderItems = items
        .filter((item) => item.orderId === order.id)
        .map((item) => ({
          ...item,
          productImages: item.productImages
            ? JSON.parse(item.productImages)
            : [],
        }));

      return {
        ...order,
        items: orderItems,
      };
    });

    res.json(merged);
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    res.status(500).json({ message: "Server error fetching orders." });
  }
};

// ✅ Get single order by ID with items
export const getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      `
        SELECT o.*, c.customerName, c.email, c.mobile
        FROM orders o
        LEFT JOIN customers c ON o.customerId = c.id
        WHERE o.id = ?
      `,
      [req.params.id]
    );

    if (orders.length === 0)
      return res.status(404).json({ message: "Order not found" });

    const order = orders[0];

    const [items] = await db.query(
      `
        SELECT 
          oi.*,
          p.title AS productTitle,
          p.price AS productPrice,
          p.images AS productImages
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.orderId = ?
      `,
      [order.id]
    );

    const orderItems = items.map((item) => ({
      ...item,
      productImages: item.productImages ? JSON.parse(item.productImages) : [],
    }));

    res.json({ ...order, items: orderItems });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Server error fetching order" });
  }
};
export const getPublicOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const [orderRows] = await db.execute(
      `
      SELECT 
        o.id,
        o.orderDate,
        o.status,
        o.totalCost,
        c.customerName,
        c.email,
        c.mobile
      FROM orders o
      JOIN customers c ON o.customerId = c.id
      WHERE o.id = ?
    `,
      [id]
    );

    if (!orderRows.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [itemRows] = await db.execute(
      `
      SELECT 
        id,
        description,
        quantity,
        amount
      FROM order_items
      WHERE orderId = ?
    `,
      [id]
    );

    return res.status(200).json({
      ...orderRows[0],
      items: itemRows,
    });
  } catch (err) {
    console.error("❌ PUBLIC TRACK ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch order",
      error: err.message,
    });
  }
};

// ✅ Update order status
export const updateOrder = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status required" });

  db.query("UPDATE orders SET status=? WHERE id=?", [status, id], (err) => {
    if (err)
      return res.status(500).json({ message: "Failed to update status" });

    res.json({ message: "Status updated" });
  });
};

// ✅ Customer order summary
export const getCustomerOrderSummary = (req, res) => {
  db.query(
    `
    SELECT c.id AS customerId, c.customerName,
           COUNT(o.id) AS totalOrders,
           IFNULL(SUM(o.totalCost),0) AS totalSpent
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customerId
    GROUP BY c.id
    ORDER BY c.id DESC
  `,
    (err, results) => {
      if (err)
        return res.status(500).json({ message: "Error fetching summary" });

      res.json(results);
    }
  );
};
