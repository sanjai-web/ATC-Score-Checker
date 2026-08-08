const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ===============================
// CORS Configuration
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:4173",

      // Render
      /\.onrender\.com$/,

      // Vercel
      /\.vercel\.app$/,

      // Netlify
      /\.netlify\.app$/,
    ],
    credentials: true,
  })
);

// ===============================
// Middleware
// ===============================
app.use(express.json());

// ===============================
// Routes
// ===============================
const analyzeRoutes = require("./routes/analyze");
const adminRoutes = require("./routes/admin");
const { ensureSchema } = require("./utils/dbHelper");

app.use("/api", analyzeRoutes);
app.use("/api/admin", adminRoutes);

// ===============================
// Health Check
// ===============================

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ATC Score Checker API is running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Health-check route for Render / cron-job.org
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "ATC Score Checker API",
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ===============================
// Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ===============================
// Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await ensureSchema();
    console.log("Database schema initialized successfully.");
  } catch (err) {
    console.error(
      "Failed to initialize Appwrite schema on startup:",
      err
    );
  }
});
