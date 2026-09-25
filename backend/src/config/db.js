const mysql = require("mysql2/promise");
require("dotenv").config();

// Create MySQL connection pool configured for Aiven SSL connections
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 28794,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, // Required for Aiven cloud-hosted MySQL SSL connections
  },
});

// Optional: Test database connectivity on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to Aiven MySQL database.");
    connection.release();
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
})();

module.exports = pool;