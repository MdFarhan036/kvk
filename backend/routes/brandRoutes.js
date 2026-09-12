import express from "express";

import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
  getBrandsByCategory,
  getPublicBrands,
} from "../controllers/brandController.js";

const router = express.Router();

// PUBLIC / STATIC ROUTES FIRST

router.get("/", getAllBrands);

router.get("/public", getPublicBrands);

router.get("/category/:categoryName", getBrandsByCategory);

// CREATE

router.post("/", createBrand);

// DYNAMIC ID ROUTES LAST

router.get("/:id", getBrandById);

router.put("/:id", updateBrand);

router.delete("/:id", deleteBrand);

export default router;