const express = require("express");
const authRoutes = require("./routes/auth.routes");
const classroomRoutes = require("./routes/classroom.routes");
const studentRoutes = require("./routes/student.routes");
const paymentServiceRoutes = require("./routes/paymentService.routes");
const paymentServiceClassRoutes = require("./routes/paymentServiceClass.routes");
const paymentOrderRoutes = require("./routes/paymentOrder.routes");
const PaymentGatewayRoutes = require("./routes/paymentGateway.routes");
const paymentWebhookRoutes = require("./routes/paymentWebhook.routes");

const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "School API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payment-services", paymentServiceRoutes);
app.use("/api/payment-service-classes", paymentServiceClassRoutes);
app.use("/api/orders", paymentOrderRoutes);
app.use("/api/payment", PaymentGatewayRoutes);
app.use("/api/payments/webhook", paymentWebhookRoutes);

module.exports = app;
