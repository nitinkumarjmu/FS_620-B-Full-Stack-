const express = require("express");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/students", studentRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("🎓 Welcome to Student Management System API");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
