import express from "express";

import {
  createDeliveryPerson,
  getDeliveryPersons,
  deleteDeliveryPerson,

  deliveryLogin,
  deliveryLogout,
  deliveryCheckAuth,

  assignOrder,
  getAssignments,

  getMyAssignments,
  acceptAssignment,

  startDelivery,
  updateDeliveryLocation,
  getDeliveryLocation,
  getOrderTracking,
  completeDelivery,
} from "../controllers/deliveryController.js";

import verifyToken, {
  verifyAdmin,
  verifyDelivery,
} from "../middlewares/authMiddleware.js";

const router = express.Router();


/* =========================================================
   DELIVERY AUTH
========================================================= */

router.post(
  "/login",
  deliveryLogin
);

router.post(
  "/logout",
  deliveryLogout
);

router.get(
  "/check-auth",
  verifyDelivery,
  deliveryCheckAuth
);


/* =========================================================
   ADMIN — DELIVERY PERSON MANAGEMENT
========================================================= */

router.post(
  "/persons",
  verifyAdmin,
  createDeliveryPerson
);

router.get(
  "/persons",
  verifyAdmin,
  getDeliveryPersons
);

router.delete(
  "/persons/:id",
  verifyAdmin,
  deleteDeliveryPerson
);


/* =========================================================
   ADMIN — ORDER ASSIGNMENT
========================================================= */

router.post(
  "/assign",
  verifyAdmin,
  assignOrder
);

router.get(
  "/assignments",
  verifyAdmin,
  getAssignments
);


/* =========================================================
   DELIVERY PERSON — ASSIGNMENTS
========================================================= */

router.get(
  "/my-assignments",
  verifyDelivery,
  getMyAssignments
);

router.post(
  "/accept",
  verifyDelivery,
  acceptAssignment
);


/* =========================================================
   DELIVERY PERSON — LIVE DELIVERY
========================================================= */

router.post(
  "/start",
  verifyDelivery,
  startDelivery
);

router.post(
  "/location",
  verifyDelivery,
  updateDeliveryLocation
);

router.get(
  "/location/:orderId",
  verifyDelivery,
  getDeliveryLocation
);

router.post(
  "/complete",
  verifyDelivery,
  completeDelivery
);


/* =========================================================
   TRACKING
========================================================= */
router.get(
  "/tracking/:orderId",
  verifyToken,
  getOrderTracking
);

export default router;