import { db } from "../db.js";
import path from "path";
import fs from "fs";
/* ================================================= */
/* ===================== ADMIN ===================== */
/* ================================================= */

/* ===== GET ALL BLOGS ===== */

export const getBlogsAdmin = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM blogs
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(
      "Error fetching blogs:",
      error
    );

    res.status(500).json({
      message: "Error fetching blogs",
    });
  }
};

/* ===== CREATE BLOG ===== */

export const createBlog = async (req, res) => {
  try {
    const body = req.body || {};

    let image_url = null;

    if (req.files?.image) {
      const image = req.files.image;

      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "blogs"
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {
          recursive: true,
        });
      }

      const fileName = `${Date.now()}-${image.name.replace(
        /\s+/g,
        "-"
      )}`;

      await image.mv(
        path.join(uploadDir, fileName)
      );

      image_url = `/uploads/blogs/${fileName}`;
    }

    const status = body.status || "draft";

    const published_at =
      body.published_at ||
      (status === "published"
        ? new Date()
        : null);

    const [result] = await db.query(
      `
      INSERT INTO blogs (
        title,
        slug,
        excerpt,
        content,
        category,
        tags,
        author_name,
        reading_time,
        image_url,
        meta_title,
        meta_description,
        sort_order,
        is_active,
        featured,
        status,
        published_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        body.title || "",
        body.slug || "",
        body.excerpt || "",
        body.content || "",
        body.category || "",
        body.tags || "",
        body.author_name || "",
        body.reading_time || "",
        image_url,
        body.meta_title || "",
        body.meta_description || "",
        Number(body.sort_order) || 1,
        Number(body.is_active) || 0,
        Number(body.featured) || 0,
        status,
        published_at,
      ]
    );

    res.status(201).json({
      message: "Blog created successfully",
      id: result.insertId,
    });

  } catch (error) {
    console.error(
      "❌ Error creating blog:",
      error
    );

    res.status(500).json({
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

/* ===== UPDATE BLOG ===== */

export const updateBlog = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const [existingRows] =
      await db.query(
        `
        SELECT *
        FROM blogs
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (
      existingRows.length === 0
    ) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    const existingBlog =
      existingRows[0];

    const image_url = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : existingBlog.image_url;

    const status =
      body.status ??
      existingBlog.status;

    let published_at =
      body.published_at ??
      existingBlog.published_at;

    if (
      status === "published" &&
      !published_at
    ) {
      published_at = new Date();
    }

    await db.query(
      `
      UPDATE blogs SET
        title = ?,
        slug = ?,
        excerpt = ?,
        content = ?,
        category = ?,
        tags = ?,
        author_name = ?,
        reading_time = ?,
        image_url = ?,
        meta_title = ?,
        meta_description = ?,
        sort_order = ?,
        is_active = ?,
        featured = ?,
        status = ?,
        published_at = ?
      WHERE id = ?
      `,
      [
        body.title ??
          existingBlog.title,

        body.slug ??
          existingBlog.slug,

        body.excerpt ??
          existingBlog.excerpt,

        body.content ??
          existingBlog.content,

        body.category ??
          existingBlog.category,

        body.tags ??
          existingBlog.tags,

        body.author_name ??
          existingBlog.author_name,

        body.reading_time ??
          existingBlog.reading_time,

        image_url,

        body.meta_title ??
          existingBlog.meta_title,

        body.meta_description ??
          existingBlog.meta_description,

        body.sort_order !== undefined
          ? Number(
              body.sort_order
            )
          : existingBlog.sort_order,

        body.is_active !== undefined
          ? Number(
              body.is_active
            )
          : existingBlog.is_active,

        body.featured !== undefined
          ? Number(
              body.featured
            )
          : existingBlog.featured,

        status,

        published_at,

        id,
      ]
    );

    res.json({
      message:
        "Blog updated successfully",
    });
  } catch (error) {
    console.error(
      "Error updating blog:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update blog",
      error: error.message,
    });
  }
};

/* ===== DELETE BLOG ===== */

export const deleteBlog = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [result] =
      await db.query(
        `
        DELETE FROM blogs
        WHERE id = ?
        `,
        [id]
      );

    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.json({
      message:
        "Blog deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting blog:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete blog",
    });
  }
};

/* ================================================= */
/* ==================== PUBLIC ===================== */
/* ================================================= */

/* ===== GET PUBLISHED BLOGS ===== */

export const getBlogsPublic = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM blogs
      WHERE is_active = 1
        AND status = 'published'
      ORDER BY
        featured DESC,
        sort_order ASC,
        published_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(
      "Error fetching public blogs:",
      error
    );

    res.status(500).json({
      message:
        "Error fetching blogs",
    });
  }
};

/* ===== GET BLOG BY SLUG ===== */

export const getBlogBySlug = async (
  req,
  res
) => {
  try {
    const { slug } = req.params;

    const [rows] =
      await db.query(
        `
        SELECT *
        FROM blogs
        WHERE slug = ?
          AND is_active = 1
          AND status = 'published'
        LIMIT 1
        `,
        [slug]
      );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(
      "Error fetching blog:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};