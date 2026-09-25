const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");
const {
  sendSupplierDecisionEmail,
} = require("../services/emailService");

router.get(
  "/subscription-plans",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const [plans] = await pool.query(
        `SELECT plan_id, plan_name, monthly_price, max_products, description
         FROM subscription_plans
         ORDER BY plan_id`,
      );

      res.json(
        plans.map((plan) => ({
          ...plan,
          monthly_price: Number(plan.monthly_price),
          max_products: Number(plan.max_products),
        })),
      );
    } catch (error) {
      console.error("Subscription plans error:", error);
      res.status(500).json({ message: "Failed to load subscription plans." });
    }
  },
);

router.get(
  "/stats",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const [buyerRows] = await pool.query(
        "SELECT COUNT(*) AS totalBuyers FROM buyers",
      );
      const [supplierRows] = await pool.query(
        "SELECT COUNT(*) AS activeSuppliers FROM suppliers WHERE approval_status = 'Approved'",
      );
      const [totalRows] = await pool.query(
        "SELECT COALESCE(SUM(total_amount), 0) AS totalVolume FROM orders",
      );

      res.json({
        totalBuyers: Number(buyerRows[0]?.totalBuyers || 0),
        activeSuppliers: Number(supplierRows[0]?.activeSuppliers || 0),
        totalVolume: Number(totalRows[0]?.totalVolume || 0),
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to load dashboard statistics." });
    }
  },
);

router.get(
  "/suppliers/pending",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const [suppliers] = await pool.query(
        `SELECT s.supplier_id, s.business_name, u.email, s.first_name, s.last_name, u.created_at
         FROM suppliers s
         JOIN users u ON s.user_id = u.user_id
         WHERE s.approval_status = 'Pending'
         ORDER BY s.created_at DESC`,
      );
      res.json(suppliers);
    } catch (error) {
      console.error("Pending suppliers error:", error);
      res
        .status(500)
        .json({ message: "Failed to retrieve pending suppliers." });
    }
  },
);

router.patch(
  "/suppliers/approve/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const [supplierRows] = await pool.query(
        `SELECT s.supplier_id, s.business_name, u.email, u.user_id
         FROM suppliers s
         JOIN users u ON u.user_id = s.user_id
         WHERE s.supplier_id = ?`,
        [req.params.id],
      );

      const supplier = supplierRows[0];

      await pool.query(
        "UPDATE suppliers SET approval_status = 'Approved', approved_at = NOW() WHERE supplier_id = ?",
        [req.params.id],
      );

      if (supplier?.user_id) {
        await pool.query("UPDATE users SET is_approved = 1 WHERE user_id = ?", [
          supplier.user_id,
        ]);
      }

      if (supplier?.email) {
        const emailResult = await sendSupplierDecisionEmail({
          email: supplier.email,
          businessName: supplier.business_name,
          status: "Approved",
        });

        if (!emailResult.sent) {
          console.warn(
            "Supplier approval email not sent:",
            emailResult.reason,
          );
        }
      }

      res.json({ message: "Supplier approved successfully." });
    } catch (error) {
      console.error("Approve supplier error:", error);
      res.status(500).json({ message: "Failed to approve supplier." });
    }
  },
);

router.patch(
  "/suppliers/decline/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const [supplierRows] = await pool.query(
        `SELECT s.supplier_id, s.business_name, u.email, u.user_id
         FROM suppliers s
         JOIN users u ON u.user_id = s.user_id
         WHERE s.supplier_id = ?`,
        [req.params.id],
      );

      const supplier = supplierRows[0];

      await pool.query(
        "UPDATE suppliers SET approval_status = 'Rejected', approved_at = NOW() WHERE supplier_id = ?",
        [req.params.id],
      );

      if (supplier?.user_id) {
        await pool.query("UPDATE users SET is_approved = 0 WHERE user_id = ?", [
          supplier.user_id,
        ]);
      }

      if (supplier?.email) {
        const emailResult = await sendSupplierDecisionEmail({
          email: supplier.email,
          businessName: supplier.business_name,
          status: "Rejected",
        });

        if (!emailResult.sent) {
          console.warn(
            "Supplier decline email not sent:",
            emailResult.reason,
          );
        }
      }

      res.json({ message: "Supplier declined successfully." });
    } catch (error) {
      console.error("Decline supplier error:", error);
      res.status(500).json({ message: "Failed to decline supplier." });
    }
  },
);

router.get(
  "/users",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
           u.user_id AS id,
           u.email,
           u.user_role AS role,
           u.is_active,
           COALESCE(b.business_name, s.business_name, 'Individual account') AS companyName,
           CASE
             WHEN u.is_active = TRUE THEN 'Active'
             ELSE 'Inactive'
           END AS status,
           COALESCE(b.contact_person, CONCAT(COALESCE(s.first_name, ''), ' ', COALESCE(s.last_name, ''))) AS name
         FROM users u
         LEFT JOIN buyers b ON b.user_id = u.user_id
         LEFT JOIN suppliers s ON s.user_id = u.user_id
         ORDER BY u.created_at DESC`,
      );

      res.json(rows);
    } catch (error) {
      console.error("Users error:", error);
      res.status(500).json({ message: "Failed to retrieve users." });
    }
  },
);

router.post(
  "/messages/send",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    const { recipientUserId, subject, messageText } = req.body;

    if (!recipientUserId || !subject || !messageText) {
      return res.status(400).json({
        message: "recipientUserId, subject and messageText are required.",
      });
    }

    try {
      await pool.query(
        "INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, FALSE)",
        [recipientUserId, subject, messageText],
      );

      res.json({ message: "Message sent successfully." });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Failed to send message." });
    }
  },
);

router.get(
  "/reports/monthly",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const [rows] = await pool.query(
        `SELECT MONTH(ordered_at) AS period, COALESCE(SUM(total_amount), 0) AS value
         FROM orders
         WHERE YEAR(ordered_at) = ?
         GROUP BY MONTH(ordered_at)
         ORDER BY MONTH(ordered_at)`,
        [year],
      );

      const data = Array.from({ length: 12 }, (_, index) => {
        const monthNumber = index + 1;
        const match = rows.find((row) => Number(row.period) === monthNumber);
        return {
          period: monthNumber,
          value: Number(match?.value || 0),
        };
      });

      res.json(data);
    } catch (error) {
      console.error("Monthly report error:", error);
      res.status(500).json({ message: "Failed to load monthly report." });
    }
  },
);

router.get(
  "/reports/weekly",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const [rows] = await pool.query(
        `SELECT WEEK(ordered_at) AS period, COALESCE(SUM(total_amount), 0) AS value
         FROM orders
         WHERE YEAR(ordered_at) = ? AND MONTH(ordered_at) = ?
         GROUP BY WEEK(ordered_at)
         ORDER BY WEEK(ordered_at)`,
        [year, month],
      );

      let data = rows.map((row) => ({
        period: Number(row.period),
        value: Number(row.value || 0),
      }));

      if (rows.length > 0) {
        const minWeek = Math.min(...rows.map((row) => Number(row.period)));
        const maxWeek = Math.max(...rows.map((row) => Number(row.period)));
        data = Array.from({ length: maxWeek - minWeek + 1 }, (_, index) => {
          const week = minWeek + index;
          const match = rows.find((row) => Number(row.period) === week);
          return {
            period: week,
            value: Number(match?.value || 0),
          };
        });
      }

      res.json(data);
    } catch (error) {
      console.error("Weekly report error:", error);
      res.status(500).json({ message: "Failed to load weekly report." });
    }
  },
);

router.get(
  "/reports/yearly",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const startYear =
        Number(req.query.startYear) || new Date().getFullYear() - 4;
      const endYear = Number(req.query.endYear) || new Date().getFullYear();
      const [rows] = await pool.query(
        `SELECT YEAR(ordered_at) AS period, COALESCE(SUM(total_amount), 0) AS value
         FROM orders
         WHERE YEAR(ordered_at) BETWEEN ? AND ?
         GROUP BY YEAR(ordered_at)
         ORDER BY YEAR(ordered_at)`,
        [startYear, endYear],
      );

      const data = Array.from(
        { length: endYear - startYear + 1 },
        (_, index) => {
          const yearValue = startYear + index;
          const match = rows.find((row) => Number(row.period) === yearValue);
          return {
            period: yearValue,
            value: Number(match?.value || 0),
          };
        },
      );

      res.json(data);
    } catch (error) {
      console.error("Yearly report error:", error);
      res.status(500).json({ message: "Failed to load yearly report." });
    }
  },
);

module.exports = router;
