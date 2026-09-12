import express from "express";
import {
  getCategories,
  addCategory,
  getCategoriesWithProducts,
  getCategoryById,
  getCategoryWithProductsById,
  updateCategory,
  getCategoryProducts,
  deleteCategory,
  getCategoryBySlug
} from "../controllers/categoryController.js";

const router = express.Router();

// ================= CATEGORY ROUTES =================

// GET all categories
router.get("/", getCategories);

// GET category by slug (IMPORTANT: before :id)
router.get("/slug/:slug", getCategoryBySlug);

// GET category with products
router.get("/:id/products", getCategoryWithProductsById);

// GET only products of category
router.get("/:categoryId/products-only", getCategoryProducts);

// GET single category
router.get("/:id", getCategoryById);

// CREATE
router.post("/", addCategory);

// UPDATE
router.put("/:id", updateCategory);

// DELETE
router.delete("/:id", deleteCategory);

// GET all categories with products
router.get("/with-products/all", getCategoriesWithProducts);

export default router;