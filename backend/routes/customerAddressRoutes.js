import express from "express";

import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from "../controllers/customerController.js";

import {
  verifyCustomer,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// ============================================
// CUSTOMER ADDRESSES
// ============================================

// Get all saved addresses
router.get(
  "/",
  verifyCustomer,
  getCustomerAddresses
);

// Add new address
router.post(
  "/",
  verifyCustomer,
  createCustomerAddress
);

// Update address
router.put(
  "/:id",
  verifyCustomer,
  updateCustomerAddress
);

// Delete address
router.delete(
  "/:id",
  verifyCustomer,
  deleteCustomerAddress
);

// Set default address
router.patch(
  "/:id/default",
  verifyCustomer,
  setDefaultCustomerAddress
);

export default router;