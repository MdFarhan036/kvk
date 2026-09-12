import express from "express";

import {
  addOrder,
  getOrders,
  getOrdersByCustomer,
  getPublicOrderById,
  getOrderById,
  updateOrder,
  getCustomerOrderSummary,
  getMyOrders,
} from "../controllers/ordersController.js";

import {
  verifyAdmin,
  verifyCustomer,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =========================================
   CUSTOMER ROUTES
========================================= */

// Logged-in customer's orders
router.get(
  "/my-orders",
  verifyCustomer,
  getMyOrders
);

// Customer order summary
router.get(
  "/customer-summary",
  getCustomerOrderSummary
);

// Orders by customer ID
router.get(
  "/customer/:customerId",
  getOrdersByCustomer
);


/* =========================================
   PUBLIC ROUTES
========================================= */

// Public order tracking
router.get(
  "/public/orders/:id",
  getPublicOrderById
);


/* =========================================
   ADMIN ROUTES
========================================= */

// Get all orders
router.get(
  "/",
  verifyAdmin,
  getOrders
);


/* =========================================
   CREATE ORDER
========================================= */

router.post(
  "/",
  addOrder
);


/* =========================================
   UPDATE ORDER
========================================= */

router.put(
  "/:id",
  updateOrder
);


/* =========================================
   SINGLE ORDER
   MUST ALWAYS BE LAST
========================================= */

router.get(
  "/:id",
  verifyAdmin,
  getOrderById
);


export default router;