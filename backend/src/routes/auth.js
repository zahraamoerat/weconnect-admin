const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Login (Supports Admin, Buyer, and Supplier)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND is_active = TRUE",
      [email],
    );

    if (users.length === 0)
      return res.status(400).json({ message: "Invalid credentials." });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    let buyerId = null;
    let supplierId = null;

    if (user.user_role === "buyer") {
      const [buyers] = await pool.query(
        "SELECT buyer_id FROM buyers WHERE user_id = ?",
        [user.user_id],
      );
      if (buyers.length > 0) buyerId = buyers[0].buyer_id;
    } else if (user.user_role === "supplier") {
      const [suppliers] = await pool.query(
        "SELECT supplier_id, approval_status FROM suppliers WHERE user_id = ?",
        [user.user_id],
      );

      if (suppliers.length > 0) {
        const approvalStatus = (
          suppliers[0].approval_status || ""
        ).toLowerCase();

        if (approvalStatus === "pending") {
          return res.status(403).json({
            message:
              "Your supplier application is pending approval by an admin.",
          });
        }

        if (approvalStatus === "rejected") {
          return res.status(403).json({
            message: "Your supplier application was rejected.",
          });
        }

        supplierId = suppliers[0].supplier_id;
      }
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.user_role, buyerId, supplierId },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "24h" },
    );

    res.json({
      token,
      role: user.user_role,
      userId: user.user_id,
      buyerId,
      supplierId,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Register Buyer
router.post("/register-buyer", async (req, res) => {
  const { email, password, business_name, contact_person } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      "INSERT INTO users (email, password_hash, user_role) VALUES (?, ?, 'buyer')",
      [email, hashedPassword],
    );

    await connection.query(
      "INSERT INTO buyers (user_id, business_name, email, contact_person) VALUES (?, ?, ?, ?)",
      [userResult.insertId, business_name, email, contact_person],
    );

    await connection.commit();
    res.status(201).json({ message: "Buyer account registered successfully." });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({
      message:
        error.sqlState === "23000"
          ? "Email already exists."
          : "Registration failed. Check the backend database connection.",
    });
  } finally {
    if (connection) connection.release();
  }
});

// Register Supplier
router.post("/register-supplier", async (req, res) => {
  const { email, password, business_name, first_name, last_name } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      "INSERT INTO users (email, password_hash, user_role) VALUES (?, ?, 'supplier')",
      [email, hashedPassword],
    );

    await connection.query(
      "INSERT INTO suppliers (user_id, business_name, email, first_name, last_name, approval_status) VALUES (?, ?, ?, ?, ?, 'Pending')",
      [userResult.insertId, business_name, email, first_name, last_name],
    );

    await connection.commit();
    res
      .status(201)
      .json({ message: "Supplier application submitted successfully." });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({
      message:
        error.sqlState === "23000"
          ? "Email already exists."
          : "Registration failed. Check the backend database connection.",
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
