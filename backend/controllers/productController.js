import { db } from "../db.js";
import fs from "fs";
import path from "path";

/** Utility to safely run a DB query */
const runQuery = async (query, params = []) => {
  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
};

/** Ensure upload folder exists */
const ensureUploadDir = () => {
  const uploadDir = path.resolve("uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const generateSlug = (text) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ============================================================
// CREATE PRODUCT
// ============================================================
export const uploadProduct = async (req, res) => {
  try {
    const b = req.body;
    const files = req.files || {};

    if (!b.title || !b.price || !b.category_id) {
      return res.status(400).json({
        error: "Required fields missing",
      });
    }

    const slug = generateSlug(b.title);

    // Check duplicate slug
    const existing = await runQuery(
      "SELECT id FROM products WHERE slug = ?",
      [slug]
    );

    if (existing.length) {
      return res.status(400).json({
        error: "Slug already exists",
      });
    }

    const uploadDir = ensureUploadDir();
    const images = [];

    if (files.images) {
      const imgs = Array.isArray(files.images)
        ? files.images
        : [files.images];

      for (const file of imgs) {
        const name = Date.now() + "_" + file.name;
        const filePath = path.join(uploadDir, name);

        await file.mv(filePath);
        images.push("/uploads/" + name);
      }
    }

    // Normalize status
    const status = String(b.status || "active").toLowerCase();

  if (!["draft", "active", "inactive"].includes(status)) {
  return res.status(400).json({
    error: "Invalid product status. Allowed values: draft, active or inactive",
  });
}

    const result = await runQuery(
      `INSERT INTO products
      (title, slug, brand, description, subdescription, category_id, oldPrice, price, stock, status, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.title,
        slug,
        b.brand,
        b.description,
        b.subdescription,
        b.category_id,
        b.oldPrice || null,
        b.price,
        b.stock || 0,
        status,
        JSON.stringify(images),
      ]
    );

    res.json({
      message: "Product created",
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================
export const getProducts = async (req, res) => {
  try {
    const results = await runQuery(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    res.json(
      results.map((p) => ({
        ...p,
        images: p.images ? JSON.parse(p.images) : [],
      }))
    );
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// GET CATEGORIES WITH PRODUCTS
// ============================================================
export const getCategoriesWithProducts = async (req, res) => {
  try {
    const q = `
      SELECT c.id AS category_id,
             c.name AS category_name,
             c.image,
             p.id AS product_id,
             p.title AS product_name,
             p.images AS pimages,
             p.price,
             p.oldPrice,
             p.description,
             p.size,
             p.weight,
             p.type,
             p.mfg,
             p.tags,
             p.life
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      ORDER BY c.id DESC
    `;

    const results = await runQuery(q);

    const categories = {};

    results.forEach((r) => {
      if (!categories[r.category_id]) {
        categories[r.category_id] = {
          id: r.category_id,
          name: r.category_name,
          image: r.image,
          products: [],
        };
      }

      if (r.product_id) {
        categories[r.category_id].products.push({
          id: r.product_id,
          name: r.product_name,
          price: r.price,
          oldPrice: r.oldPrice,
          description: r.description,
          images: r.pimages ? JSON.parse(r.pimages) : [],
          size: r.size,
          weight: r.weight,
          type: r.type,
          mfg: r.mfg,
          tags: r.tags,
          life: r.life,
        });
      }
    });

    res.json(Object.values(categories));
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================
export const getProductById = async (req, res) => {
  try {
    const [p] = await runQuery(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );

    if (!p) {
      return res.status(404).json({
        error: "Not found",
      });
    }

    res.json({
      ...p,
      description: p.description,
      subdescription: p.subdescription,
      images: JSON.parse(p.images || "[]"),
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// SAVE PRODUCT TABS
// ============================================================
export const saveProductTabs = async (req, res) => {
  try {
    const { productId } = req.params;
    const { tabs } = req.body;

    if (!Array.isArray(tabs)) {
      return res.status(400).json({
        error: "Tabs must be an array",
      });
    }

    // Delete old tabs
    await db.query(
      "DELETE FROM product_tabs WHERE product_id = ?",
      [productId]
    );

    // Insert new tabs
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];

      if (!tab.title) continue;

      await db.query(
        `INSERT INTO product_tabs
        (product_id, title, content, sort_order)
        VALUES (?, ?, ?, ?)`,
        [
          productId,
          tab.title,
          tab.content || "",
          tab.sort_order ?? i,
        ]
      );
    }

    res.json({
      message: "Tabs saved successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// GET PRODUCT TABS
// ============================================================
export const getProductTabs = async (req, res) => {
  try {
    const { productId } = req.params;

    const rows = await runQuery(
      "SELECT * FROM product_tabs WHERE product_id = ? ORDER BY sort_order ASC",
      [productId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const b = req.body;

    // Normalize and validate status
    const status = String(b.status || "active").toLowerCase();

  if (!["draft", "active", "inactive"].includes(status)) {
  return res.status(400).json({
    error: "Invalid product status. Allowed values: draft, active or inactive",
  });
}

    const existing = await runQuery(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    let images = JSON.parse(existing[0].images || "[]");

    // Upload new images
    if (req.files?.images) {
      const uploadDir = ensureUploadDir();

      // Delete old images
      images.forEach((img) => {
        const filePath = path.join(process.cwd(), img);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      images = [];

      const imgs = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imgs) {
        const name = Date.now() + "_" + file.name;
        const filePath = path.join(uploadDir, name);

        await file.mv(filePath);
        images.push("/uploads/" + name);
      }
    }

    const slug = generateSlug(
      b.title || existing[0].title
    );

    await runQuery(
      `UPDATE products SET
        title=?,
        slug=?,
        brand=?,
        description=?,
        subdescription=?,
        category_id=?,
        oldPrice=?,
        price=?,
        stock=?,
        status=?,
        images=?
      WHERE id=?`,
      [
        b.title,
        slug,
        b.brand,
        b.description,
        b.subdescription,
        b.category_id,
        b.oldPrice,
        b.price,
        b.stock,
        status,
        JSON.stringify(images),
        id,
      ]
    );

    res.json({
      message: "Updated successfully",
    });
  } catch (err) {
    console.error("Update product error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [p] = await runQuery(
      "SELECT images FROM products WHERE id=?",
      [id]
    );

    if (p?.images) {
      JSON.parse(p.images).forEach((img) => {
        const filePath = path.join(process.cwd(), img);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await runQuery(
      "DELETE FROM products WHERE id=?",
      [id]
    );

    res.json({
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// TOGGLE POPULAR
// ============================================================
export const togglePopular = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_popular } = req.body;

    await runQuery(
      "UPDATE products SET is_popular = ? WHERE id = ?",
      [
        is_popular ? 1 : 0,
        id,
      ]
    );

    res.json({
      success: true,
      message: "⭐ Popular status updated",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// GET POPULAR PRODUCTS GROUPED BY CATEGORY
// ============================================================
export const getPopularProductsByCategory = async (req, res) => {
  try {
    const sql = `
      SELECT p.*,
             c.name AS category_name,
             c.image AS category_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_popular = 1
      ORDER BY c.id, p.createdAt DESC
    `;

    const results = await runQuery(sql);

    const categories = [];

    results.forEach((p) => {
      let cat = categories.find(
        (c) => c.id === p.category_id
      );

      if (!cat) {
        cat = {
          id: p.category_id,
          name: p.category_name,
          image: p.category_image,
          products: [],
        };

        categories.push(cat);
      }

      cat.products.push({
        id: p.id,
        title: p.title,
        brand: p.brand,
        price: p.price,
        oldPrice: p.oldPrice,
        images: p.images
          ? JSON.parse(p.images)
          : [],
      });
    });

    res.json(categories);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// TOGGLE DAILY DEAL
// ============================================================
export const toggleDailyDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_daily_deal, daily_deal_price } = req.body;

    await runQuery(
      `UPDATE products
       SET is_daily_deal=?,
           daily_deal_price=?
       WHERE id=?`,
      [
        is_daily_deal ? 1 : 0,
        daily_deal_price || null,
        id,
      ]
    );

    res.json({
      message: "🔥 Daily deal updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// GET DAILY DEALS
// ============================================================
export const getDailyDeals = async (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM products
      WHERE is_daily_deal = 1
        AND (
          daily_deal_end IS NULL
          OR daily_deal_end > NOW()
        )
      ORDER BY daily_deal_end ASC
    `;

    const results = await runQuery(sql);

    res.json(results);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// UPDATE DAILY DEAL PRICE
// ============================================================
export const updateDailyDealPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || isNaN(price)) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    const result = await runQuery(
      "UPDATE products SET daily_deal_price = ? WHERE id = ?",
      [price, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "💰 Daily deal price updated",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// UPDATE PRODUCT STATUS
// ============================================================
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: rawStatus } = req.body;

    // Normalize and validate status
    const status = String(rawStatus || "").toLowerCase();

  if (!["draft", "active", "inactive"].includes(status)) {
  return res.status(400).json({
    error: "Invalid product status. Allowed values: draft, active or inactive",
  });
}

    await runQuery(
      "UPDATE products SET status = ? WHERE id = ?",
      [status, id]
    );

    res.json({
      success: true,
      message: "🟢 Status updated",
    });
  } catch (err) {
    console.error("Update product status error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// ============================================================
// GET RELATED PRODUCTS
// ============================================================
export const getRelatedProducts = async (req, res) => {
  try {
    const { categoryId, productId } = req.params;

    const products = await runQuery(
      `SELECT id, title, price, images, slug
       FROM products
       WHERE category_id = ?
       AND id != ?
       LIMIT 8`,
      [categoryId, productId]
    );

    res.json(
      products.map((p) => ({
        ...p,
        images: JSON.parse(p.images || "[]"),
      }))
    );
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};