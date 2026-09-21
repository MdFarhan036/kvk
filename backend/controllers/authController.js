import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "1259bb8f20d42f92ab42e27f85bdbc2a00cbc4bc80b41ba7fef1fe19ed79318ceed9d490baf649467205761e9f6e38dc71afbf13ec7edbcc6cd674c5ca530978";
// ------------------ Signup ------------------
export const customerSignup = async (req, res) => {
  const {
    name,
    email,
    password,
    mobile,
    address,
    city,
    state,
    pincode,
  } = req.body;

  console.log("✅ customerSignup HIT", req.body);

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    console.log("⏳ Checking existing customer...");

    const [rows] = await db.query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    console.log(
      "✅ Existing customer query completed"
    );

    if (rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.log("⏳ Hashing password...");

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    console.log(
      "✅ Password hashed, inserting customer..."
    );

    const [result] = await db.query(
      `INSERT INTO customers
      (
        customerName,
        email,
        password,
        mobile,
        address,
        city,
        state,
        pincode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        mobile || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
      ]
    );

    console.log(
      "✅ Customer created:",
      result.insertId
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      customer: {
        id: result.insertId,
        name,
        email,
        mobile,
        address,
        city,
        state,
        pincode,
      },
    });
  } catch (err) {
    console.error(
      "🔥 customerSignup crashed:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};



export const customerLogin = async (req, res) => {
  console.log("✅ customerLogin HIT", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("❌ Missing email/password");
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    console.log("⏳ Running DB query...");

    const [rows] = await db.query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    console.log("✅ DB Response:", rows);

    if (rows.length === 0) {
      console.log("❌ Customer not found");
      return res.status(404).json({ message: "Customer not found" });
    }

    const customer = rows[0];
    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: customer.id, role: "customer" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ Login successful, sending response");

    return res.status(200).json({
      message: "Login successful",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    });

  } catch (err) {
    console.error("🔥 customerLogin crashed:", err);
    return res.status(500).json({ message: "Login crashed" });
  }
};
export const checkCustomerAuth = async (req, res) => {
  try {
    if (!req.customer) {
      return res.status(401).json({ isAuthenticated: false });
    }

    const customerId = req.customer.id;

    const [rows] = await db.query(
      "SELECT id, customerName, email FROM customers WHERE id = ?",
      [customerId]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ isAuthenticated: false });
    }

    return res.json({
      isAuthenticated: true,
      user: {
        id: rows[0].id,
        name: rows[0].customerName,
        email: rows[0].email,
      },
    });
  } catch (err) {
    console.error("🔥 checkCustomerAuth crashed:", err);
    return res.status(500).json({ isAuthenticated: false });
  }
};


// ------------------ Logout ------------------
export const customerLogout = (req, res) => {
  res.clearCookie("customer_token", {
    httpOnly: true,
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
};

// ------------------ Profile ------------------
export const getProfile = (req, res) => {
  if (!req.customer) return res.status(401).json({ message: "Unauthorized" });

  const customerId = req.customer.id;
  db.query(
    "SELECT id, name, email, mobile, address, city, state, pincode, createdAt FROM customers WHERE id = ?",
    [customerId],
    (err, rows) => {
      if (err || rows.length === 0)
        return res.status(404).json({ message: "Profile not found" });
      res.json(rows[0]);
    }
  );
};
export const updateProfile = async ( req, res ) => { if (!req.customer) { return res.status(401).json({ message: "Unauthorized", }); } const customerId = req.customer.id; const { name, mobile, address, city, state, pincode, } = req.body; if (!name || !name.trim()) { return res.status(400).json({ success: false, message: "Name is required", }); } try { const [result] = await db.query( `UPDATE customers SET customerName = ?, mobile = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?`, [ name.trim(), mobile?.trim() || null, address?.trim() || null, city?.trim() || null, state?.trim() || null, pincode?.trim() || null, customerId, ] ); if (result.affectedRows === 0) { return res.status(404).json({ success: false, message: "Customer not found", }); } const [rows] = await db.query( `SELECT id, customerName, email, mobile, address, city, state, pincode, createdAt, profileImage FROM customers WHERE id = ?`, [customerId] ); if (!rows || rows.length === 0) { return res.status(404).json({ success: false, message: "Profile not found after update", }); } const customer = rows[0]; console.log( "✅ Customer profile updated:", customerId ); return res.status(200).json({ success: true, message: "Profile updated successfully", customer: { id: customer.id, name: customer.customerName, email: customer.email, mobile: customer.mobile, address: customer.address, city: customer.city, state: customer.state, pincode: customer.pincode, createdAt: customer.createdAt, profileImage: customer.profileImage, }, }); } catch (err) { console.error( "🔥 updateProfile crashed:", err ); return res.status(500).json({ success: false, message: "Failed to update profile", }); } };