import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "1259bb8f20d42f92ab42e27f85bdbc2a00cbc4bc80b41ba7fef1fe19ed79318ceed9d490baf649467205761e9f6e38dc71afbf13ec7edbcc6cd674c5ca530978";


/* =========================================================
   CREATE DELIVERY PERSON
   ADMIN ONLY
========================================================= */

export const createDeliveryPerson = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      state,
      city,
      address,
      pincode,
    } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and mobile are required",
      });
    }

    const [existing] = await db.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password,
        mobile,
        role,
        state,
        city,
        address,
        pincode
      )
      VALUES (?, ?, ?, ?, 'delivery', ?, ?, ?, ?)
      `,
      [
        name,
        email,
        hashedPassword,
        mobile,
        state || null,
        city || null,
        address || null,
        pincode || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Delivery person created successfully",
      deliveryPersonId: result.insertId,
    });

  } catch (error) {
    console.error("CREATE DELIVERY PERSON ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create delivery person",
    });
  }
};


/* =========================================================
   GET DELIVERY PERSONS
   ADMIN ONLY
========================================================= */

export const getDeliveryPersons = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        mobile,
        state,
        city,
        address,
        pincode,
        createdAt
      FROM users
      WHERE role = 'delivery'
      ORDER BY id DESC
      `
    );

    res.json({
      success: true,
      deliveryPersons: rows,
    });

  } catch (error) {
    console.error("GET DELIVERY PERSONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery persons",
    });
  }
};


/* =========================================================
   DELETE DELIVERY PERSON
   ADMIN ONLY
========================================================= */

export const deleteDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
        AND role = 'delivery'
      LIMIT 1
      `,
      [id]
    );

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: "Delivery person not found",
      });
    }

    const [activeAssignments] = await db.query(
      `
      SELECT id
      FROM delivery_assignments
      WHERE deliveryPersonId = ?
        AND status IN (
          'assigned',
          'accepted',
          'out_for_delivery'
        )
      LIMIT 1
      `,
      [id]
    );

    if (activeAssignments.length) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete delivery person with active assignments",
      });
    }

    await db.query(
      `
      DELETE FROM users
      WHERE id = ?
        AND role = 'delivery'
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Delivery person deleted successfully",
    });

  } catch (error) {
    console.error("DELETE DELIVERY PERSON ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete delivery person",
    });
  }
};


/* =========================================================
   DELIVERY LOGIN
========================================================= */

export const deliveryLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        password,
        mobile,
        role,
        state,
        city,
        address,
        pincode
      FROM users
      WHERE email = ?
        AND role = 'delivery'
      LIMIT 1
      `,
      [email]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: "delivery",
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("delivery_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Delivery login successful",

      deliveryPerson: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        state: user.state,
        city: user.city,
        address: user.address,
        pincode: user.pincode,
      },
    });

  } catch (error) {
    console.error("DELIVERY LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


/* =========================================================
   DELIVERY LOGOUT
========================================================= */

export const deliveryLogout = async (req, res) => {
  res.clearCookie("delivery_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  res.json({
    success: true,
    message: "Delivery logout successful",
  });
};


/* =========================================================
   DELIVERY CHECK AUTH
========================================================= */

export const deliveryCheckAuth = async (req, res) => {
  res.json({
    success: true,
    isAuthenticated: true,

    deliveryPerson: {
      id: req.deliveryPerson.id,
      name: req.deliveryPerson.name,
      email: req.deliveryPerson.email,
      mobile: req.deliveryPerson.mobile,
      role: req.deliveryPerson.role,
    },
  });
};


/* =========================================================
   ADMIN — ASSIGN ORDER
========================================================= */

export const assignOrder = async (req, res) => {
  try {
    const { orderId, deliveryPersonId } = req.body;

    if (!orderId || !deliveryPersonId) {
      return res.status(400).json({
        success: false,
        message:
          "orderId and deliveryPersonId are required",
      });
    }

    /* CHECK ORDER */

    const [orders] = await db.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = ?
      LIMIT 1
      `,
      [orderId]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (orders[0].status === "Delivered") {
      return res.status(400).json({
        success: false,
        message:
          "Delivered order cannot be assigned",
      });
    }

    if (orders[0].status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled order cannot be assigned",
      });
    }

    /* CHECK DELIVERY PERSON */

    const [deliveryPersons] = await db.query(
      `
      SELECT id, name, mobile
      FROM users
      WHERE id = ?
        AND role = 'delivery'
      LIMIT 1
      `,
      [deliveryPersonId]
    );

    if (!deliveryPersons.length) {
      return res.status(404).json({
        success: false,
        message: "Delivery person not found",
      });
    }

    /* CHECK EXISTING ASSIGNMENT */

    const [existing] = await db.query(
      `
      SELECT id, status, deliveryPersonId
      FROM delivery_assignments
      WHERE orderId = ?
      LIMIT 1
      `,
      [orderId]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Order is already assigned",
        assignment: existing[0],
      });
    }

    /* CREATE ASSIGNMENT */

    const [result] = await db.query(
      `
      INSERT INTO delivery_assignments
      (
        orderId,
        deliveryPersonId,
        status
      )
      VALUES (?, ?, 'assigned')
      `,
      [
        orderId,
        deliveryPersonId,
      ]
    );

    /* UPDATE ORDER */

    await db.query(
      `
      UPDATE orders
      SET status = 'Shipped'
      WHERE id = ?
      `,
      [orderId]
    );

    res.status(201).json({
      success: true,
      message: "Order assigned successfully",

      assignment: {
        id: result.insertId,
        orderId,
        deliveryPersonId,
        deliveryPersonName:
          deliveryPersons[0].name,
        status: "assigned",
      },
    });

  } catch (error) {
    console.error("ASSIGN ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign order",
    });
  }
};


/* =========================================================
   ADMIN — GET ASSIGNMENTS
========================================================= */

export const getAssignments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        da.id,
        da.orderId,
        da.deliveryPersonId,
        da.status,
        da.assignedAt,
        da.acceptedAt,
        da.startedAt,
        da.completedAt,

        u.name AS deliveryPersonName,
        u.email AS deliveryPersonEmail,
        u.mobile AS deliveryPersonMobile,

        o.customerId,
        o.totalCost,
        o.paymentMethod,
        o.paymentStatus,
        o.status AS orderStatus,

        oa.fullName AS customerName,
        oa.mobile AS customerMobile,
        oa.houseNo,
        oa.addressLine1,
        oa.addressLine2,
        oa.landmark,
        oa.city,
        oa.state,
        oa.pincode,
        oa.country,
        oa.latitude,
        oa.longitude

      FROM delivery_assignments da

      INNER JOIN users u
        ON u.id = da.deliveryPersonId

      INNER JOIN orders o
        ON o.id = da.orderId

      LEFT JOIN order_addresses oa
        ON oa.orderId = o.id

      ORDER BY da.createdAt DESC
      `
    );

    res.json({
      success: true,
      assignments: rows,
    });

  } catch (error) {
    console.error("GET ASSIGNMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch delivery assignments",
    });
  }
};


/* =========================================================
   DELIVERY PERSON — MY ASSIGNMENTS
========================================================= */

export const getMyAssignments = async (req, res) => {
  try {
    const deliveryPersonId =
      req.deliveryPerson.id;

    const [rows] = await db.query(
      `
      SELECT
        da.id,
        da.orderId,
        da.status,
        da.assignedAt,
        da.acceptedAt,
        da.startedAt,
        da.completedAt,

        o.customerId,
        o.totalCost,
        o.paymentMethod,
        o.paymentStatus,
        o.status AS orderStatus,

        oa.fullName AS customerName,
        oa.mobile AS customerMobile,
        oa.houseNo,
        oa.addressLine1,
        oa.addressLine2,
        oa.landmark,
        oa.city,
        oa.state,
        oa.pincode,
        oa.country,
        oa.latitude,
        oa.longitude

      FROM delivery_assignments da

      INNER JOIN orders o
        ON o.id = da.orderId

      LEFT JOIN order_addresses oa
        ON oa.orderId = o.id

      WHERE da.deliveryPersonId = ?

      ORDER BY da.createdAt DESC
      `,
      [deliveryPersonId]
    );

    res.json({
      success: true,
      assignments: rows,
    });

  } catch (error) {
    console.error(
      "GET MY ASSIGNMENTS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch assigned orders",
    });
  }
};


/* =========================================================
   DELIVERY PERSON — ACCEPT
========================================================= */

export const acceptAssignment = async (req, res) => {
  try {
    const deliveryPersonId = req.deliveryPerson.id;

    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required",
      });
    }

    const [result] = await db.query(
      `
      UPDATE delivery_assignments
      SET
        status = 'accepted',
        acceptedAt = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deliveryPersonId = ?
        AND status = 'assigned'
      `,
      [
        assignmentId,
        deliveryPersonId,
      ]
    );

    if (!result.affectedRows) {
      return res.status(400).json({
        success: false,
        message:
          "Assignment not found or already accepted",
      });
    }

    res.json({
      success: true,
      message: "Delivery assignment accepted",
    });

  } catch (error) {
    console.error(
      "ACCEPT ASSIGNMENT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to accept assignment",
    });
  }
};

/* =========================================================
   START DELIVERY
========================================================= */
export const startDelivery = async (req, res) => {
  try {
    const deliveryPersonId = req.deliveryPerson.id;

    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required",
      });
    }

    const [assignments] = await db.query(
      `
      SELECT id, orderId, status
      FROM delivery_assignments
      WHERE id = ?
        AND deliveryPersonId = ?
        AND status = 'accepted'
      LIMIT 1
      `,
      [
        assignmentId,
        deliveryPersonId,
      ]
    );

    if (!assignments.length) {
      return res.status(403).json({
        success: false,
        message:
          "Valid accepted delivery assignment not found",
      });
    }

    const orderId = assignments[0].orderId;

    await db.query(
      `
      UPDATE delivery_assignments
      SET
        status = 'out_for_delivery',
        startedAt = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deliveryPersonId = ?
        AND status = 'accepted'
      `,
      [
        assignmentId,
        deliveryPersonId,
      ]
    );

    await db.query(
      `
      UPDATE orders
      SET status = 'Shipped'
      WHERE id = ?
      `,
      [orderId]
    );

    res.json({
      success: true,
      message: "Delivery started",
      orderId,
      assignmentId,
    });

  } catch (error) {
    console.error(
      "START DELIVERY ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to start delivery",
    });
  }
};


/* =========================================================
   UPDATE DELIVERY GPS
========================================================= */

export const updateDeliveryLocation = async (
  req,
  res
) => {
  try {
    const deliveryPersonId =
      req.deliveryPerson.id;

    const {
      orderId,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
    } = req.body;

    if (
      !orderId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "orderId, latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid GPS coordinates",
      });
    }

    const [assignments] = await db.query(
      `
      SELECT id
      FROM delivery_assignments
      WHERE orderId = ?
        AND deliveryPersonId = ?
        AND status = 'out_for_delivery'
      LIMIT 1
      `,
      [
        orderId,
        deliveryPersonId,
      ]
    );

    if (!assignments.length) {
      return res.status(403).json({
        success: false,
        message:
          "Active delivery assignment not found",
      });
    }

    const gpsAccuracy =
      accuracy !== undefined &&
      Number.isFinite(Number(accuracy))
        ? Number(accuracy)
        : null;

    const gpsSpeed =
      speed !== undefined &&
      Number.isFinite(Number(speed))
        ? Number(speed)
        : null;

    const gpsHeading =
      heading !== undefined &&
      Number.isFinite(Number(heading))
        ? Number(heading)
        : null;

    await db.query(
      `
      INSERT INTO delivery_locations
      (
        orderId,
        deliveryPersonId,
        latitude,
        longitude,
        accuracy,
        speed,
        heading
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        deliveryPersonId,
        lat,
        lng,
        gpsAccuracy,
        gpsSpeed,
        gpsHeading,
      ]
    );

    res.json({
      success: true,
      message: "Location updated",

      location: {
        latitude: lat,
        longitude: lng,
        accuracy: gpsAccuracy,
        speed: gpsSpeed,
        heading: gpsHeading,
      },
    });

  } catch (error) {
    console.error(
      "UPDATE DELIVERY LOCATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update delivery location",
    });
  }
};


/* =========================================================
   GET CURRENT DELIVERY LOCATION
========================================================= */

export const getDeliveryLocation = async (
  req,
  res
) => {
  try {
    const { orderId } = req.params;

    const [locations] = await db.query(
      `
      SELECT
        dl.latitude,
        dl.longitude,
        dl.accuracy,
        dl.speed,
        dl.heading,
        dl.recordedAt,

        u.id AS deliveryPersonId,
        u.name AS deliveryPersonName,
        u.mobile AS deliveryPersonMobile

      FROM delivery_locations dl

      INNER JOIN users u
        ON u.id = dl.deliveryPersonId

      WHERE dl.orderId = ?

      ORDER BY
        dl.recordedAt DESC,
        dl.id DESC

      LIMIT 1
      `,
      [orderId]
    );

    if (!locations.length) {
      return res.json({
        success: true,
        location: null,
      });
    }

    res.json({
      success: true,
      location: locations[0],
    });

  } catch (error) {
    console.error(
      "GET DELIVERY LOCATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch delivery location",
    });
  }
};


/* =========================================================
   CUSTOMER / ADMIN — COMPLETE TRACKING
========================================================= */
export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    /* =====================================================
       GET ORDER + DESTINATION
    ===================================================== */

    const [orders] = await db.query(
      `
      SELECT
        o.id,
        o.customerId,
        o.status,
        o.paymentStatus,
        o.totalCost,

        oa.fullName,
        oa.mobile,
        oa.houseNo,
        oa.addressLine1,
        oa.addressLine2,
        oa.landmark,
        oa.city,
        oa.state,
        oa.pincode,
        oa.country,
        oa.latitude AS destinationLatitude,
        oa.longitude AS destinationLongitude

      FROM orders o

      LEFT JOIN order_addresses oa
        ON oa.orderId = o.id

      WHERE o.id = ?

      LIMIT 1
      `,
      [orderId]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    /* =====================================================
       CHECK AUTHORIZED USER
    ===================================================== */

    const role = req.user?.role;

    let authenticatedUserId = null;

    if (role === "customer") {
      authenticatedUserId = req.user.id;
    }

    if (role === "admin") {
      authenticatedUserId = req.user.id;
    }

    if (role === "delivery") {
      authenticatedUserId = req.user.id;
    }

    if (!authenticatedUserId || !role) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    /* =====================================================
       CUSTOMER
       Only the owner of the order can track it
    ===================================================== */

    if (
      role === "customer" &&
      Number(order.customerId) !== Number(authenticatedUserId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to track this order",
      });
    }

    /* =====================================================
       DELIVERY PERSON
       Only assigned delivery person can track it
    ===================================================== */

    if (role === "delivery") {
      const [deliveryAccess] = await db.query(
        `
        SELECT id
        FROM delivery_assignments
        WHERE orderId = ?
          AND deliveryPersonId = ?
        LIMIT 1
        `,
        [
          orderId,
          authenticatedUserId,
        ]
      );

      if (!deliveryAccess.length) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this order",
        });
      }
    }

    /* =====================================================
       GET DELIVERY ASSIGNMENT
    ===================================================== */

    const [assignments] = await db.query(
      `
      SELECT
        da.id,
        da.deliveryPersonId,
        da.status,
        da.assignedAt,
        da.acceptedAt,
        da.startedAt,
        da.completedAt,

        u.name AS deliveryPersonName,
        u.mobile AS deliveryPersonMobile

      FROM delivery_assignments da

      INNER JOIN users u
        ON u.id = da.deliveryPersonId

      WHERE da.orderId = ?

      LIMIT 1
      `,
      [orderId]
    );

    let deliveryPerson = null;
    let currentLocation = null;

    /* =====================================================
       DELIVERY LOCATION
    ===================================================== */

    if (assignments.length) {
      const assignment = assignments[0];

      deliveryPerson = {
        id: assignment.deliveryPersonId,
        name: assignment.deliveryPersonName,
        mobile: assignment.deliveryPersonMobile,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        acceptedAt: assignment.acceptedAt,
        startedAt: assignment.startedAt,
        completedAt: assignment.completedAt,
      };

   const [locations] = await db.query(
  `
  SELECT
    latitude,
    longitude,
    accuracy,
    speed,
    heading,
    createdAt AS recordedAt

  FROM delivery_locations

  WHERE orderId = ?
    AND deliveryPersonId = ?

  ORDER BY
    createdAt DESC,
    id DESC

  LIMIT 1
  `,
  [
    orderId,
    assignment.deliveryPersonId,
  ]
);

      if (locations.length) {
        currentLocation = locations[0];
      }
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    res.json({
      success: true,

      order: {
        id: order.id,
        customerId: order.customerId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalCost: order.totalCost,
      },

      destination: {
        fullName: order.fullName,
        mobile: order.mobile,
        houseNo: order.houseNo,
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        landmark: order.landmark,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        country: order.country,

        latitude: order.destinationLatitude,
        longitude: order.destinationLongitude,
      },

      deliveryPerson,

      currentLocation,
    });

  } catch (error) {
    console.error(
      "GET ORDER TRACKING ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch order tracking",
    });
  }
};

/* =========================================================
   COMPLETE DELIVERY
========================================================= */
/* =========================================================
   COMPLETE DELIVERY — VERIFICATION CODE REQUIRED
========================================================= */

export const completeDelivery = async (req, res) => {
  try {
    const deliveryPersonId = req.deliveryPerson.id;

    const {
      assignmentId,
      verificationCode,
    } = req.body;

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId is required",
      });
    }

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    const enteredCode =
      String(verificationCode).trim();

    /* =====================================================
       GET ACTIVE ASSIGNMENT + ORDER CODE
    ===================================================== */

    const [assignments] = await db.query(
      `
      SELECT
        da.id,
        da.orderId,
        da.status,

        o.deliveryVerificationCode

      FROM delivery_assignments da

      INNER JOIN orders o
        ON o.id = da.orderId

      WHERE da.id = ?
        AND da.deliveryPersonId = ?
        AND da.status = 'out_for_delivery'

      LIMIT 1
      `,
      [
        assignmentId,
        deliveryPersonId,
      ]
    );

    if (!assignments.length) {
      return res.status(403).json({
        success: false,
        message:
          "Active delivery assignment not found",
      });
    }

    const assignment = assignments[0];

    /* =====================================================
       CHECK VERIFICATION CODE
    ===================================================== */

    if (!assignment.deliveryVerificationCode) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery verification code is not available for this order",
      });
    }

    if (
      String(assignment.deliveryVerificationCode).trim() !==
      enteredCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    /* =====================================================
       COMPLETE ASSIGNMENT
    ===================================================== */

    const [assignmentResult] = await db.query(
      `
      UPDATE delivery_assignments
      SET
        status = 'completed',
        completedAt = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deliveryPersonId = ?
        AND status = 'out_for_delivery'
      `,
      [
        assignmentId,
        deliveryPersonId,
      ]
    );

    if (!assignmentResult.affectedRows) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery could not be completed",
      });
    }

    /* =====================================================
       UPDATE ORDER
    ===================================================== */

    await db.query(
      `
      UPDATE orders
      SET status = 'Delivered'
      WHERE id = ?
      `,
      [assignment.orderId]
    );

    /* =====================================================
       SUCCESS
    ===================================================== */

    res.json({
      success: true,
      message:
        "Delivery completed successfully",
      orderId: assignment.orderId,
      assignmentId,
    });

  } catch (error) {
    console.error(
      "COMPLETE DELIVERY ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to complete delivery",
    });
  }
};