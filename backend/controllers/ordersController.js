import { db } from "../db.js";

// =====================================================
// CREATE NEW ORDER WITH ITEMS + ORDER ADDRESS SNAPSHOT
// =====================================================
export const addOrder = async (req, res) => {
  console.log("✅ FULL BODY RECEIVED:", req.body);

  const {
    customerId,
    addressId,
    totalCost,
    status,
    paymentMethod,
    paymentStatus,
    remarks,
    items,
  } = req.body;

  // =====================================================
  // BASIC VALIDATION
  // =====================================================

  if (
    !customerId ||
    totalCost === undefined ||
    totalCost === null
  ) {
    return res.status(400).json({
      message: "Missing required order fields",
    });
  }

  // Address is mandatory
  if (!addressId) {
    return res.status(400).json({
      message:
        "Delivery address is required before placing the order.",
    });
  }

  try {
    // =====================================================
    // START TRANSACTION
    // =====================================================

    await db.query("START TRANSACTION");

    // =====================================================
    // 1. GET SELECTED CUSTOMER ADDRESS
    // =====================================================

    const [addressRows] = await db.query(
      `
      SELECT
        id,
        customerId,
        addressType,
        fullName,
        mobile,
        houseNo,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        pincode,
        country,
        latitude,
        longitude
      FROM customer_addresses
      WHERE id = ?
        AND customerId = ?
      LIMIT 1
      `,
      [
        addressId,
        customerId,
      ]
    );

    if (addressRows.length === 0) {
      await db.query("ROLLBACK");

      return res.status(400).json({
        message: "Invalid delivery address.",
      });
    }

    const address = addressRows[0];

    console.log(
      "📍 VERIFIED ORDER ADDRESS:",
      address
    );

    // =====================================================
    // VALIDATE COORDINATES
    // =====================================================

    let latitude = null;
    let longitude = null;

    if (
      address.latitude !== null &&
      address.latitude !== undefined &&
      address.latitude !== ""
    ) {
      latitude = Number(address.latitude);

      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        await db.query("ROLLBACK");

        return res.status(400).json({
          message: "Invalid delivery latitude.",
        });
      }
    }

    if (
      address.longitude !== null &&
      address.longitude !== undefined &&
      address.longitude !== ""
    ) {
      longitude = Number(address.longitude);

      if (
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        await db.query("ROLLBACK");

        return res.status(400).json({
          message: "Invalid delivery longitude.",
        });
      }
    }

    // =====================================================
    // 2. GENERATE DELIVERY VERIFICATION CODE
    // TEMPORARY — CONSOLE ONLY
    // =====================================================

   const deliveryVerificationCode =
  Math.floor(100000 + Math.random() * 900000).toString();

console.log(
  `🔐 DELIVERY VERIFICATION CODE | Order: ${orderId} | Code: ${deliveryVerificationCode}`
);

    // =====================================================
    // 3. INSERT ORDER
    // =====================================================

    const orderQuery = `
      INSERT INTO orders
      (
        customerId,
        totalCost,
        status,
        paymentMethod,
        paymentStatus,
        remarks
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [orderResult] =
      await db.execute(
        orderQuery,
        [
          customerId,
          totalCost,
          status || "Pending",
          paymentMethod || null,
          paymentStatus || "Pending",
          remarks || "",
        ]
      );

    const orderId =
      orderResult.insertId;

    console.log(
      "✅ ORDER CREATED WITH ID:",
      orderId
    );

    console.log(
      `🔐 ORDER ${orderId} DELIVERY VERIFICATION CODE: ${deliveryVerificationCode}`
    );

    // =====================================================
    // 4. SAVE PERMANENT ORDER ADDRESS SNAPSHOT
    // =====================================================

    await db.execute(
      `
      INSERT INTO order_addresses
      (
        orderId,
        addressType,
        fullName,
        mobile,
        houseNo,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        pincode,
        country,
        latitude,
        longitude
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,

        address.addressType ||
          "Home",

        address.fullName,

        address.mobile,

        address.houseNo,

        address.addressLine1,

        address.addressLine2 ||
          null,

        address.landmark ||
          null,

        address.city,

        address.state,

        address.pincode,

        address.country ||
          "India",

        latitude,

        longitude,
      ]
    );

    console.log(
      "📍 ORDER ADDRESS SNAPSHOT SAVED:",
      {
        orderId,
        latitude,
        longitude,
      }
    );

    // =====================================================
    // 5. INSERT ORDER ITEMS
    // =====================================================

    if (
      Array.isArray(items) &&
      items.length > 0
    ) {
      const itemQuery = `
        INSERT INTO order_items
        (
          orderId,
          product_id,
          quantity,
          description,
          amount
        )
        VALUES (?, ?, ?, ?, ?)
      `;

      for (const i of items) {
        console.log(
          "➡️ INSERTING ITEM:",
          i
        );

        await db.execute(
          itemQuery,
          [
            orderId,

            Number(
              i.productId
            ),

            Number(
              i.quantity || 1
            ),

            i.description ||
              "",

            Number(
              i.amount || 0
            ),
          ]
        );
      }

      console.log(
        "✅ ALL ORDER ITEMS INSERTED SUCCESSFULLY"
      );
    }

    // =====================================================
    // 6. CREATE TRANSACTION / INVOICE
    // =====================================================

    const invoiceNo =
      "INV-" +
      String(orderId).padStart(
        4,
        "0"
      );

    await db.execute(
      `
      INSERT INTO transactions
      (
        orderId,
        invoice_no,
        amount,
        status
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        orderId,

        invoiceNo,

        totalCost,

        paymentStatus ||
          "PENDING",
      ]
    );

    console.log(
      "🧾 Transaction created for order",
      orderId
    );

    // =====================================================
    // 7. COMMIT
    // =====================================================

    await db.query("COMMIT");

    console.log(
      "🎉 ORDER COMPLETED SUCCESSFULLY:",
      orderId
    );

    // =====================================================
    // 8. FINAL RESPONSE
    // =====================================================

    return res.status(201).json({
      message:
        "Order + Address + Items + Transaction created successfully",

      orderId,
    });

  } catch (err) {

    // =====================================================
    // ROLLBACK
    // =====================================================

    try {
      await db.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "❌ ROLLBACK FAILED:",
        rollbackError
      );
    }

    console.error(
      "❌ ADD ORDER FAILED:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to create order",

      error:
        err.sqlMessage ||
        err.message ||
        err,
    });
  }
};

// =====================================================
// GET ALL ORDERS
// INCLUDING ORDER ADDRESS + LAT/LNG + ITEMS
// =====================================================

export const getOrders = async (
  req,
  res
) => {
  try {

    // ===================================================
    // 1. GET ORDERS
    // ===================================================

    const [orders] =
      await db.query(`
        SELECT
          o.*,
          c.customerName,
          c.email,
          c.mobile
        FROM orders o
        LEFT JOIN customers c
          ON o.customerId = c.id
        ORDER BY o.orderDate DESC
      `);

    if (
      orders.length === 0
    ) {
      return res.json([]);
    }

    const orderIds =
      orders.map(
        (order) =>
          order.id
      );

    // ===================================================
    // 2. GET ORDER ITEMS
    // ===================================================

    const [items] =
      await db.query(
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

    // ===================================================
    // 3. GET ORDER ADDRESSES
    // ===================================================

    const [
      orderAddresses,
    ] = await db.query(
      `
      SELECT
        id,
        orderId,
        addressType,
        fullName,
        mobile,
        houseNo,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        pincode,
        country,
        latitude,
        longitude,
        createdAt
      FROM order_addresses
      WHERE orderId IN (?)
      `,
      [orderIds]
    );

    // ===================================================
    // 4. MERGE ORDERS
    // ===================================================

    const merged =
      orders.map(
        (order) => {

          const orderItems =
            items
              .filter(
                (item) =>
                  Number(
                    item.orderId
                  ) ===
                  Number(
                    order.id
                  )
              )
              .map(
                (item) => {

                  let productImages =
                    [];

                  try {
                    productImages =
                      item.productImages
                        ? JSON.parse(
                            item.productImages
                          )
                        : [];
                  } catch (error) {
                    productImages =
                      [];
                  }

                  return {
                    ...item,
                    productImages,
                  };
                }
              );

          const orderAddress =
            orderAddresses.find(
              (address) =>
                Number(
                  address.orderId
                ) ===
                Number(
                  order.id
                )
            ) || null;

          return {
            ...order,

            items:
              orderItems,

            orderAddress,
          };
        }
      );

    return res.json(
      merged
    );

  } catch (err) {

    console.error(
      "❌ Error fetching orders:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to fetch orders",
    });
  }
};


// =====================================================
// GET LOGGED-IN CUSTOMER ORDERS
// INCLUDING ORDER ADDRESS + LAT/LNG + ITEMS
// =====================================================

export const getMyOrders =
  async (
    req,
    res
  ) => {

    try {

      console.log(
        "CUSTOMER AUTH DATA:",
        req.customer
      );

      const customerId =
        req.customer?.id ||
        req.customer?.customerId ||
        req.user?.id ||
        req.user?.customerId;

      if (!customerId) {
        return res.status(401).json({
          message:
            "Customer authentication required",
        });
      }

      // =================================================
      // 1. GET ORDERS
      // =================================================

      const [orders] =
        await db.query(
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

      if (
        orders.length === 0
      ) {
        return res.json([]);
      }

      const orderIds =
        orders.map(
          (order) =>
            order.id
        );

      // =================================================
      // 2. GET ORDER ITEMS
      // =================================================

      const [items] =
        await db.query(
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

      // =================================================
      // 3. GET ORDER ADDRESSES
      // =================================================

      const [
        orderAddresses,
      ] = await db.query(
        `
        SELECT
          id,
          orderId,
          addressType,
          fullName,
          mobile,
          houseNo,
          addressLine1,
          addressLine2,
          landmark,
          city,
          state,
          pincode,
          country,
          latitude,
          longitude,
          createdAt
        FROM order_addresses
        WHERE orderId IN (?)
        `,
        [orderIds]
      );

      // =================================================
      // 4. MERGE
      // =================================================

      const mergedOrders =
        orders.map(
          (order) => {

            const orderItems =
              items
                .filter(
                  (item) =>
                    Number(
                      item.orderId
                    ) ===
                    Number(
                      order.id
                    )
                )
                .map(
                  (item) => {

                    let productImages =
                      [];

                    try {
                      productImages =
                        item.productImages
                          ? JSON.parse(
                              item.productImages
                            )
                          : [];
                    } catch (error) {
                      productImages =
                        [];
                    }

                    return {
                      ...item,
                      productImages,
                    };
                  }
                );

            const orderAddress =
              orderAddresses.find(
                (address) =>
                  Number(
                    address.orderId
                  ) ===
                  Number(
                    order.id
                  )
              ) || null;

            return {
              ...order,

              items:
                orderItems,

              orderAddress,
            };
          }
        );

      return res.json(
        mergedOrders
      );

    } catch (error) {

      console.error(
        "❌ Error fetching my orders:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch your orders",
      });
    }
  };


// =====================================================
// GET ORDERS BY CUSTOMER ID
// INCLUDING PERMANENT ORDER ADDRESS SNAPSHOT
// + LATITUDE / LONGITUDE
// =====================================================

export const getOrdersByCustomer =
  async (
    req,
    res
  ) => {

    const {
      customerId,
    } = req.params;

    try {

      // =================================================
      // 1. GET ORDERS
      // =================================================

      const [orders] =
        await db.query(
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

      if (
        orders.length === 0
      ) {
        return res.json([]);
      }

      // =================================================
      // 2. GET ORDER IDS
      // =================================================

      const orderIds =
        orders.map(
          (order) =>
            order.id
        );

      // =================================================
      // 3. GET ORDER ITEMS
      // =================================================

      const [items] =
        await db.query(
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

      // =================================================
      // 4. GET ORDER ADDRESS SNAPSHOTS
      // =================================================

      const [
        orderAddresses,
      ] = await db.query(
        `
        SELECT
          id,
          orderId,
          addressType,
          fullName,
          mobile,
          houseNo,
          addressLine1,
          addressLine2,
          landmark,
          city,
          state,
          pincode,
          country,
          latitude,
          longitude,
          createdAt
        FROM order_addresses
        WHERE orderId IN (?)
        `,
        [orderIds]
      );

      // =================================================
      // 5. MERGE EVERYTHING
      // =================================================

      const merged =
        orders.map(
          (order) => {

            // -------------------------------------------
            // ORDER ITEMS
            // -------------------------------------------

            const orderItems =
              items
                .filter(
                  (item) =>
                    Number(
                      item.orderId
                    ) ===
                    Number(
                      order.id
                    )
                )
                .map(
                  (item) => {

                    let productImages =
                      [];

                    try {
                      productImages =
                        item.productImages
                          ? JSON.parse(
                              item.productImages
                            )
                          : [];
                    } catch (error) {
                      productImages =
                        [];
                    }

                    return {
                      ...item,
                      productImages,
                    };
                  }
                );

            // -------------------------------------------
            // ORDER ADDRESS
            // -------------------------------------------

            const address =
              orderAddresses.find(
                (address) =>
                  Number(
                    address.orderId
                  ) ===
                  Number(
                    order.id
                  )
              ) || null;

            return {
              ...order,

              items:
                orderItems,

              orderAddress:
                address,
            };
          }
        );

      return res.json(
        merged
      );

    } catch (err) {

      console.error(
        "❌ Error fetching customer orders:",
        err
      );

      return res.status(500).json({
        message:
          "Server error fetching customer orders.",
      });
    }
  };


// =====================================================
// GET SINGLE ORDER BY ID
// INCLUDING ORDER ADDRESS + LAT/LNG + ITEMS
// =====================================================

export const getOrderById =
  async (
    req,
    res
  ) => {

    try {

      // =================================================
      // 1. GET ORDER + CUSTOMER
      // =================================================

      const [orders] =
        await db.query(
          `
          SELECT
            o.*,
            c.customerName,
            c.email,
            c.mobile
          FROM orders o
          LEFT JOIN customers c
            ON o.customerId = c.id
          WHERE o.id = ?
          LIMIT 1
          `,
          [req.params.id]
        );

      if (
        orders.length === 0
      ) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      const order =
        orders[0];

      // =================================================
      // 2. GET PERMANENT ORDER ADDRESS SNAPSHOT
      // =================================================

      const [
        addressRows,
      ] = await db.query(
        `
        SELECT
          id,
          orderId,
          addressType,
          fullName,
          mobile,
          houseNo,
          addressLine1,
          addressLine2,
          landmark,
          city,
          state,
          pincode,
          country,
          latitude,
          longitude,
          createdAt
        FROM order_addresses
        WHERE orderId = ?
        LIMIT 1
        `,
        [order.id]
      );

      const orderAddress =
        addressRows.length > 0
          ? addressRows[0]
          : null;

      // =================================================
      // 3. GET ORDER ITEMS
      // =================================================

      const [items] =
        await db.query(
          `
          SELECT
            oi.*,
            p.title AS productTitle,
            p.price AS productPrice,
            p.images AS productImages
          FROM order_items oi
          LEFT JOIN products p
            ON oi.product_id = p.id
          WHERE oi.orderId = ?
          ORDER BY oi.id ASC
          `,
          [order.id]
        );

      // =================================================
      // 4. PARSE PRODUCT IMAGES
      // =================================================

      const orderItems =
        items.map(
          (item) => {

            let productImages =
              [];

            try {
              productImages =
                item.productImages
                  ? JSON.parse(
                      item.productImages
                    )
                  : [];
            } catch (error) {
              productImages =
                [];
            }

            return {
              ...item,
              productImages,
            };
          }
        );

      // =================================================
      // 5. RETURN COMPLETE ORDER
      // =================================================

      return res.json({
        ...order,

        orderAddress,

        items:
          orderItems,
      });

    } catch (err) {

      console.error(
        "❌ Error fetching order:",
        err
      );

      return res.status(500).json({
        message:
          "Server error fetching order",
      });
    }
  };


// =====================================================
// GET PUBLIC ORDER BY ID
// INCLUDING PERMANENT ORDER ADDRESS
// + LATITUDE / LONGITUDE
// =====================================================

export const getPublicOrderById =
  async (
    req,
    res
  ) => {

    const {
      id,
    } = req.params;

    try {

      // =================================================
      // 1. GET ORDER + CUSTOMER
      // =================================================

      const [
        orderRows,
      ] = await db.execute(
        `
        SELECT
          o.id,
          o.orderDate,
          o.status,
          o.totalCost,
          o.paymentMethod,
          o.paymentStatus,
          o.remarks,

          c.customerName,
          c.email,
          c.mobile

        FROM orders o

        JOIN customers c
          ON o.customerId = c.id

        WHERE o.id = ?

        LIMIT 1
        `,
        [id]
      );

      if (
        !orderRows.length
      ) {
        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      const order =
        orderRows[0];

      // =================================================
      // 2. GET PERMANENT ORDER ADDRESS
      // =================================================

      const [
        addressRows,
      ] = await db.execute(
        `
        SELECT
          id,
          orderId,
          addressType,
          fullName,
          mobile,
          houseNo,
          addressLine1,
          addressLine2,
          landmark,
          city,
          state,
          pincode,
          country,
          latitude,
          longitude,
          createdAt

        FROM order_addresses

        WHERE orderId = ?

        LIMIT 1
        `,
        [id]
      );

      const orderAddress =
        addressRows.length > 0
          ? addressRows[0]
          : null;

      // =================================================
      // 3. GET ORDER ITEMS
      // =================================================

      const [
        itemRows,
      ] = await db.execute(
        `
        SELECT
          oi.id,
          oi.product_id,
          oi.description,
          oi.quantity,
          oi.amount,

          p.title AS productTitle,
          p.price AS productPrice,
          p.images AS productImages

        FROM order_items oi

        LEFT JOIN products p
          ON oi.product_id = p.id

        WHERE oi.orderId = ?

        ORDER BY oi.id ASC
        `,
        [id]
      );

      // =================================================
      // 4. PARSE PRODUCT IMAGES
      // =================================================

      const items =
        itemRows.map(
          (item) => {

            let productImages =
              [];

            try {
              productImages =
                item.productImages
                  ? JSON.parse(
                      item.productImages
                    )
                  : [];
            } catch (error) {
              productImages =
                [];
            }

            return {
              ...item,
              productImages,
            };
          }
        );

      // =================================================
      // 5. RETURN COMPLETE ORDER
      // =================================================

      return res.status(200).json({
        ...order,

        orderAddress,

        items,
      });

    } catch (err) {

      console.error(
        "❌ PUBLIC TRACK ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Failed to fetch order",

        error:
          err.message,
      });
    }
  };


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

export const updateOrder =
  (req, res) => {

    const {
      id,
    } = req.params;

    const {
      status,
    } = req.body;

    if (!status) {
      return res.status(400).json({
        message:
          "Status required",
      });
    }

    db.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [
        status,
        id,
      ],
      (err) => {

        if (err) {
          console.error(
            "❌ UPDATE ORDER STATUS ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to update status",
          });
        }

        return res.json({
          message:
            "Status updated",
        });
      }
    );
  };


// =====================================================
// CUSTOMER ORDER SUMMARY
// =====================================================

export const getCustomerOrderSummary =
  (req, res) => {

    db.query(
      `
      SELECT
        c.id AS customerId,
        c.customerName,
        COUNT(o.id) AS totalOrders,
        IFNULL(
          SUM(o.totalCost),
          0
        ) AS totalSpent
      FROM customers c
      LEFT JOIN orders o
        ON c.id = o.customerId
      GROUP BY c.id
      ORDER BY c.id DESC
      `,
      (err, results) => {

        if (err) {
          console.error(
            "❌ CUSTOMER SUMMARY ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Error fetching summary",
          });
        }

        return res.json(
          results
        );
      }
    );
  };