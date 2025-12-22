const express = require("express");
const authRoutes = require("./routes/auth.routes");
const classroomRoutes = require("./routes/classroom.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "School API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/students", studentRoutes);

module.exports = app;
