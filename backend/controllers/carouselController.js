import { db } from "../db.js";
import fs from "fs";

// =====================================================
// ADD SLIDE
// =====================================================

export const addCarousel = async (req, res) => {
  try {
    const {
      title,
      link,
      status,
      sort_order,
    } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        error: "Image required",
      });
    }

    const image = req.files.image;

    const uploadDir = "uploads/carousel";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    const fileName = `${Date.now()}_${image.name}`;

    const imagePath =
      `/${uploadDir}/${fileName}`;

    await image.mv(`.${imagePath}`);

    await db.query(
      `INSERT INTO home_carousel
       (image, title, link, status, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [
        imagePath,
        title || null,
        link || null,
        status || "active",
        sort_order || 0,
      ]
    );

    res.json({
      message: "Carousel added",
    });
  } catch (err) {
    console.error(
      "Add carousel error:",
      err
    );

    res.status(500).json({
      error: "Failed to add carousel",
    });
  }
};

// =====================================================
// ADMIN LIST
// =====================================================

export const getAdminCarousels = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM home_carousel
       ORDER BY sort_order ASC, id DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error(
      "Get admin carousels error:",
      err
    );

    res.status(500).json({
      error: "Failed to fetch carousel slides",
    });
  }
};

// =====================================================
// PUBLIC / CUSTOMER LIST
// =====================================================

export const getPublicCarousels = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      `SELECT
         id,
         image,
         title,
         link
       FROM home_carousel
       WHERE status = 'active'
       ORDER BY sort_order ASC`
    );

    res.json(rows);
  } catch (err) {
    console.error(
      "Get public carousels error:",
      err
    );

    res.status(500).json({
      error: "Failed to fetch carousel slides",
    });
  }
};

// =====================================================
// GET SINGLE CAROUSEL
// =====================================================

export const getCarouselById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM home_carousel
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Carousel slide not found",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(
      "Get carousel by ID error:",
      err
    );

    res.status(500).json({
      error: "Failed to fetch carousel slide",
    });
  }
};

// =====================================================
// UPDATE CAROUSEL
// =====================================================

export const updateCarousel = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      title,
      link,
      status,
      sort_order,
    } = req.body;

    // -----------------------------------------------
    // FIND EXISTING SLIDE
    // -----------------------------------------------

    const [rows] = await db.query(
      `SELECT *
       FROM home_carousel
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Carousel slide not found",
      });
    }

    const existingSlide = rows[0];

    let imagePath = existingSlide.image;

    // -----------------------------------------------
    // HANDLE NEW IMAGE
    // -----------------------------------------------

    if (req.files && req.files.image) {
      const image = req.files.image;

      const uploadDir =
        "uploads/carousel";

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {
          recursive: true,
        });
      }

      const fileName =
        `${Date.now()}_${image.name}`;

      const newImagePath =
        `/${uploadDir}/${fileName}`;

      await image.mv(`.${newImagePath}`);

      // Delete old image
      if (
        existingSlide.image &&
        fs.existsSync(`.${existingSlide.image}`)
      ) {
        fs.unlink(
          `.${existingSlide.image}`,
          (unlinkError) => {
            if (unlinkError) {
              console.error(
                "Old carousel image delete error:",
                unlinkError
              );
            }
          }
        );
      }

      imagePath = newImagePath;
    }

    // -----------------------------------------------
    // UPDATE DATABASE
    // -----------------------------------------------

    await db.query(
      `UPDATE home_carousel
       SET
         image = ?,
         title = ?,
         link = ?,
         status = ?,
         sort_order = ?
       WHERE id = ?`,
      [
        imagePath,
        title || null,
        link || null,
        status || "active",
        sort_order || 0,
        id,
      ]
    );

    res.json({
      message: "Carousel updated successfully",
    });
  } catch (err) {
    console.error(
      "Update carousel error:",
      err
    );

    res.status(500).json({
      error: "Failed to update carousel",
    });
  }
};

// =====================================================
// DELETE SLIDE
// =====================================================

export const deleteCarousel = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [[row]] = await db.query(
      `SELECT image
       FROM home_carousel
       WHERE id = ?`,
      [id]
    );

    if (!row) {
      return res.status(404).json({
        error: "Carousel slide not found",
      });
    }

    if (
      row.image &&
      fs.existsSync(`.${row.image}`)
    ) {
      fs.unlink(
        `.${row.image}`,
        (unlinkError) => {
          if (unlinkError) {
            console.error(
              "Carousel image delete error:",
              unlinkError
            );
          }
        }
      );
    }

    await db.query(
      `DELETE FROM home_carousel
       WHERE id = ?`,
      [id]
    );

    res.json({
      message: "Carousel deleted",
    });
  } catch (err) {
    console.error(
      "Delete carousel error:",
      err
    );

    res.status(500).json({
      error: "Failed to delete carousel",
    });
  }
};