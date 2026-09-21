import express from "express";
import {
  customerSignup,
  customerLogin,
  customerLogout,
  checkCustomerAuth,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { verifyCustomer } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", customerSignup);
router.post("/login", customerLogin);
router.get("/check-auth", verifyCustomer, checkCustomerAuth);
router.post("/logout", verifyCustomer, customerLogout);
router.get("/profile", verifyCustomer, getProfile);
router.put( "/profile", verifyCustomer, updateProfile );
export default router;
