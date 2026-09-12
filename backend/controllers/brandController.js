// controllers/brandController.js
import { db } from "../db.js";
import fs from "fs";
import slugify from "slugify";

/* =============================
   CREATE BRAND
============================= */
export const createBrand = async (req, res) => {
  try {
    const { brand_name } = req.body;

    if (!brand_name) {
      return res.status(400).json({
        error: "Brand name is required",
      });
    }

    const [exists] = await db.query(
      "SELECT id FROM brands WHERE brand_name=?",
      [brand_name]
    );

    if (exists.length) {
      return res.status(400).json({
        error: "Brand already exists",
      });
    }

    const slug = slugify(brand_name, {
      lower: true,
    });

    let imagePath = null;

    if (req.files?.brand_image) {
      const image = req.files.brand_image;
      const uploadDir = "uploads/brands";

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {
          recursive: true,
        });
      }

      const fileName = `${Date.now()}_${image.name}`;

      imagePath = `/${uploadDir}/${fileName}`;

      await image.mv(`.${imagePath}`);
    }

    await db.query(
      `
        INSERT INTO brands (
          brand_name,
          slug,
          image
        )
        VALUES (?, ?, ?)
      `,
      [
        brand_name,
        slug,
        imagePath,
      ]
    );

    res.json({
      message: "Brand added successfully",
    });
  } catch (error) {
    console.error(
      "❌ Error creating brand:",
      error
    );

    res.status(500).json({
      error: "Failed to create brand",
    });
  }
};


/* =============================
   GET BRANDS BY CATEGORY
============================= */
export const getBrandsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    const [rows] = await db.query(
      `
        SELECT DISTINCT
          p.brand AS brand_name
        FROM products p
        INNER JOIN categories c
          ON p.category_id = c.id
        WHERE LOWER(c.name) = LOWER(?)
          AND p.brand IS NOT NULL
          AND p.brand != ''
        ORDER BY p.brand ASC
      `,
      [categoryName]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching brands by category:", error);

    res.status(500).json({
      error: "Failed to fetch brands for category",
    });
  }
};


/* =============================
   GET ALL BRANDS
============================= */
export const getAllBrands = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM brands ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error(
      "❌ Error fetching brands:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch brands",
    });
  }
};


/* =============================
   UPDATE BRAND
============================= */
export const updateBrand = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { brand_name } = req.body;

    const slug = brand_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let imageSql = "";
    let params = [
      brand_name,
      slug,
    ];

    if (req.files?.brand_image) {
      const image = req.files.brand_image;
      const uploadDir = "uploads/brands";

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {
          recursive: true,
        });
      }

      const fileName =
        `${Date.now()}_${image.name}`;

      const imagePath =
        `/${uploadDir}/${fileName}`;

      await image.mv(`.${imagePath}`);

      imageSql = ", image=?";
      params.push(imagePath);
    }

    params.push(id);

    await db.query(
      `
        UPDATE brands
        SET
          brand_name=?,
          slug=?
          ${imageSql}
        WHERE id=?
      `,
      params
    );

    res.json({
      message: "Brand updated successfully",
    });
  } catch (error) {
    console.error(
      "❌ Error updating brand:",
      error
    );

    res.status(500).json({
      error: "Failed to update brand",
    });
  }
};


/* =============================
   DELETE BRAND
============================= */
export const deleteBrand = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [[brand]] = await db.query(
      "SELECT image FROM brands WHERE id=?",
      [id]
    );

    if (brand?.image) {
      fs.unlink(`.${brand.image}`, () => {});
    }

    await db.query(
      "DELETE FROM brands WHERE id=?",
      [id]
    );

    res.json({
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ Error deleting brand:",
      error
    );

    res.status(500).json({
      error: "Failed to delete brand",
    });
  }
};


/* =============================
   GET BRAND BY ID
============================= */
export const getBrandById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [[brand]] = await db.query(
      "SELECT * FROM brands WHERE id=?",
      [id]
    );

    res.json(brand);
  } catch (error) {
    console.error(
      "❌ Error fetching brand:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch brand",
    });
  }
};


/* =============================
   PUBLIC BRANDS
============================= */
export const getPublicBrands = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      `
        SELECT
          id,
          brand_name,
          slug,
          image
        FROM brands
        ORDER BY brand_name ASC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error(
      "❌ Error fetching public brands:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch brands",
    });
  }
};