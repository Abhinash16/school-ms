// apps/platform/api/src/app.js
const express = require("express");

const schoolRoutes = require("./routes/school.routes");

const app = express();

app.use(express.json());

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "Platform API running" });
});

// Routes
app.use("/api/schools", schoolRoutes);

module.exports = app;
