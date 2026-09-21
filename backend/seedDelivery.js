import bcrypt from "bcryptjs";
import { db } from "./db.js";

const seedDelivery = async () => {
  try {
    const name = "Delivery";
    const email = "delivery@kvk.com";
    const password = "delivery@123";
    const mobile = "8879878778";
    const role = "delivery";

    // Check if user already exists
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      // Update existing user
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        `UPDATE users
         SET name = ?,
             password = ?,
             mobile = ?,
             role = ?
         WHERE email = ?`,
        [name, hashedPassword, mobile, role, email]
      );

      console.log("✅ Delivery user updated successfully");
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`👤 Role: ${role}`);

      process.exit(0);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users
       (name, email, password, mobile, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, mobile, role]
    );

    console.log("✅ Delivery user created successfully");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: ${role}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed Delivery user:", error);
    process.exit(1);
  }
};

seedDelivery();