import express from "express";

import {
  getBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsPublic,
  getBlogBySlug,
} from "../controllers/blogController.js";

import uploadBlog from "../middleware/uploadBlog.js";

const router = express.Router();

/* ================= ADMIN ================= */

router.get(
  "/admin/blogs",
  getBlogsAdmin
);

router.post(
  "/admin/blogs",
  uploadBlog.single("image"),
  createBlog
);

router.put(
  "/admin/blogs/:id",
  uploadBlog.single("image"),
  updateBlog
);

router.delete(
  "/admin/blogs/:id",
  deleteBlog
);

/* ================= PUBLIC ================= */

router.get(
  "/blogs",
  getBlogsPublic
);

router.get(
  "/blogs/:slug",
  getBlogBySlug
);

export default router;