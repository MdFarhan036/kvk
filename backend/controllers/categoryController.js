import { db } from "../db.js";

const generateSlug = (text) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ================= GET ALL =================
export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, slug, image, meta_title
      FROM categories
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
// Add a new category
export const addCategory = async (req, res) => {
  try {
    let {
      name,
      slug,
      meta_title,
      meta_description,
      keywords,
      canonical_url,
      structured_data,
    } = req.body;

    if (!req.files?.image) {
      return res.status(400).json({ error: "Category image is required" });
    }

    const finalSlug = slug || generateSlug(name);

    // ✅ CHECK DUPLICATE SLUG
    const [existing] = await db.query(
      "SELECT id FROM categories WHERE slug = ?",
      [finalSlug]
    );

    if (existing.length) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    // ✅ JSON FIX
    let parsedStructuredData = null;
    if (structured_data?.trim()) {
      parsedStructuredData = JSON.stringify(JSON.parse(structured_data));
    }

    const image = req.files.image;
    const uploadPath = `uploads/${Date.now()}_${image.name}`;

    await image.mv(uploadPath);

    const [result] = await db.query(
      `INSERT INTO categories 
      (name, slug, image, meta_title, meta_description, keywords, canonical_url, structured_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        finalSlug,
        `/${uploadPath}`,
        meta_title || "",
        meta_description || "",
        keywords || "",
        canonical_url || "",
        parsedStructuredData,
      ]
    );

    res.json({ message: "Category created", id: result.insertId });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get categories with products
export const getCategoriesWithProducts = (req, res) => {
  const q = `
    SELECT c.id AS category_id, c.name AS category_name, c.image,
           p.id AS product_id, p.name AS product_name, p.pimage, 
           p.pdescription, p.orgprice, p.disprice
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    ORDER BY c.id DESC
  `;

  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Group products under each category
    const categories = {};
    results.forEach(row => {
      if (!categories[row.category_id]) {
        categories[row.category_id] = {
          id: row.category_id,
          name: row.category_name,
          image: row.image,
          products: []
        };
      }
      if (row.product_id) {
        categories[row.category_id].products.push({
          id: row.product_id,
          name: row.product_name,
          pimage: row.pimage,
          pdescription: row.pdescription,
          orgprice: row.orgprice,
          disprice: row.disprice
        });
      }
    });

    res.json(Object.values(categories));
  });
};
// Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM categories WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    let {
      name,
      slug,
      meta_title,
      meta_description,
      keywords,
      canonical_url,
      structured_data,
    } = req.body;

    const finalSlug = slug || generateSlug(name);

    // ✅ CHECK DUPLICATE SLUG (exclude current)
    const [existing] = await db.query(
      "SELECT id FROM categories WHERE slug = ? AND id != ?",
      [finalSlug, id]
    );

    if (existing.length) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    let parsedStructuredData = null;
    if (structured_data?.trim()) {
      parsedStructuredData = JSON.stringify(JSON.parse(structured_data));
    }

    let imagePath = null;

    if (req.files?.image) {
      const image = req.files.image;
      const uploadPath = `uploads/${Date.now()}_${image.name}`;
      await image.mv(uploadPath);
      imagePath = `/${uploadPath}`;
    }

    const query = `
      UPDATE categories SET
        name = ?,
        slug = ?,
        ${imagePath ? "image = ?," : ""}
        meta_title = ?,
        meta_description = ?,
        keywords = ?,
        canonical_url = ?,
        structured_data = ?
      WHERE id = ?
    `;

    const params = imagePath
      ? [
          name,
          finalSlug,
          imagePath,
          meta_title,
          meta_description,
          keywords,
          canonical_url,
          parsedStructuredData,
          id,
        ]
      : [
          name,
          finalSlug,
          meta_title,
          meta_description,
          keywords,
          canonical_url,
          parsedStructuredData,
          id,
        ];

    await db.query(query, params);

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get single category with products by ID
export const getCategoryWithProductsById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT c.id, c.name, c.image,
              p.id AS product_id, p.name AS product_name,
              p.pimage, p.pdescription, p.orgprice, p.disprice
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       WHERE c.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Category not found" });
    }

    const category = {
      id: rows[0].id,
      name: rows[0].name,
      image: rows[0].image,
      products: [],
    };

    rows.forEach((row) => {
      if (row.product_id) {
        category.products.push({
          id: row.product_id,
          name: row.product_name,
          image: row.pimage,
          description: row.pdescription,
          price: row.disprice,
        });
      }
    });

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products by category
export const getCategoryProducts = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [rows] = await db.query(
      `SELECT 
        p.id, p.name, p.pdescription, p.pimage,
        p.orgprice, p.disprice,
        c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?`,
      [categoryId]
    );

    res.json({
      id: categoryId,
      name: rows[0]?.category_name || "Category",
      products: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const [rows] = await db.query(
      `SELECT c.id, c.name, c.slug, c.image,
              p.id AS product_id, p.name, p.pimage,
              p.pdescription, p.orgprice, p.disprice
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       WHERE c.slug = ?`,
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Not found" });
    }

    const category = {
      id: rows[0].id,
      name: rows[0].name,
      slug: rows[0].slug,
      image: rows[0].image,
      products: [],
    };

    rows.forEach((row) => {
      if (row.product_id) {
        category.products.push({
          id: row.product_id,
          name: row.name,
          image: row.pimage,
          description: row.pdescription,
          price: row.disprice,
        });
      }
    });

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};