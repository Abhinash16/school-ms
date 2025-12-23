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

const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const paymentSettlementQueue = require("../../../../queues/paymentSettlement.queue");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(paymentSettlementQueue)],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

app.post("/api/test/add-settlement", async (req, res) => {
  const settlement = req.body;

  try {
    await paymentSettlementQueue.add(
      "settle-payment",
      {
        settlementQueueId: 12,
      },
      {
        jobId: `RAZORPAY:pay_Rv1QLashK9f1aaclKaU:payment.captured`,
      }
    );
    return res.json({ status: "job added", settlement });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = app;
