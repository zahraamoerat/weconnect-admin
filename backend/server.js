const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/admin");

const app = express();
const PORT = process.env.PORT || 28794;

// Configured CORS Options
const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite default port
    "http://localhost:5175", // WeConnect Admin dev port
    "http://localhost:8080", // Vue CLI default port
    "http://localhost:3000", // Alternative local dev port
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Main Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});