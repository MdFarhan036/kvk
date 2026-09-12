import express from "express";
import { db } from "../db.js"; // ✅ FIX (missing import)

import {
  uploadProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategoriesWithProducts,
  togglePopular,
  getPopularProductsByCategory,
  toggleDailyDeal,
  updateDailyDealPrice,
  getDailyDeals,
  updateStatus,
  getRelatedProducts,
  saveProductTabs,
  getProductTabs,
} from "../controllers/productController.js";

const router = express.Router();

// ================= SPECIAL ROUTES (TOP PRIORITY) =================

// Search
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    const [products] = await db.query(
      `SELECT * FROM products
       WHERE title LIKE ? 
          OR brand LIKE ?`,
      [`%${q}%`, `%${q}%`]
    );

    res.json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

// Daily Deals
router.get("/deals/daily", getDailyDeals);
router.patch("/:id/deals/toggle", toggleDailyDeal);
router.patch("/:id/deals/price", updateDailyDealPrice);

// Popular
router.patch("/:id/popular", togglePopular);
router.get("/popular/by-category", getPopularProductsByCategory);

// Related Products
router.get("/related/:categoryId/:productId", getRelatedProducts);

// Categories with products
router.get("/categories/with-products", getCategoriesWithProducts);

// Status
router.patch("/:id/status", updateStatus);

// ================= MAIN CRUD =================
router.get("/:productId/tabs", getProductTabs);
router.post("/:productId/tabs", saveProductTabs);
// Get all
router.get("/", getProducts);

// Create
router.post("/", uploadProduct);

// Get single (⚠️ KEEP LAST)
router.get("/:id", getProductById);

// Update
router.put("/:id", updateProduct);

// Delete
router.delete("/:id", deleteProduct);
// Product Tabs

export default router;