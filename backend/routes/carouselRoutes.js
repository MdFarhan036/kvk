import express from "express";

import {
  addCarousel,
  getAdminCarousels,
  getPublicCarousels,
  getCarouselById,
  updateCarousel,
  deleteCarousel,
} from "../controllers/carouselController.js";

const router = express.Router();

// ============================================
// ADD CAROUSEL
// ============================================

router.post("/", addCarousel);

// ============================================
// ADMIN - GET ALL CAROUSELS
// ============================================

router.get("/admin", getAdminCarousels);

// ============================================
// PUBLIC - GET ACTIVE CAROUSELS
// ============================================

router.get("/public", getPublicCarousels);

// ============================================
// GET SINGLE CAROUSEL
// ============================================

router.get("/:id", getCarouselById);

// ============================================
// UPDATE CAROUSEL
// ============================================

router.put("/:id", updateCarousel);

// ============================================
// DELETE CAROUSEL
// ============================================

router.delete("/:id", deleteCarousel);

export default router;