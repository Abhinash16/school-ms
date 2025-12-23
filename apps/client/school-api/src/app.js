const express = require("express");
const authRoutes = require("./routes/auth.routes");
const classroomRoutes = require("./routes/classroom.routes");
const studentRoutes = require("./routes/student.routes");
const paymentServiceRoutes = require("./routes/paymentService.routes");
const paymentServiceClassRoutes = require("./routes/paymentServiceClass.routes");
const paymentOrderRoutes = require("./routes/paymentOrder.routes");
const PaymentGatewayRoutes = require("./routes/paymentGateway.routes");
const paymentWebhookRoutes = require("./routes/paymentWebhook.routes");

const cors = require("cors");
const app = express();
app.use(cors());
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
  const payload = req.body; // full payload from Razorpay / Cashfree

  try {
    // Extract necessary info from payload
    const entity =
      payload.payload?.payment?.entity || payload.payload?.payment_link?.entity;

    if (!entity?.id || !entity?.notes?.order_id || !entity?.notes?.school_id) {
      return res
        .status(400)
        .json({ error: "Missing required fields in payload" });
    }

    const settlementQueueId = entity.notes.settlementQueueId || 10; // fallback for testing
    const jobId = `RAZORPAY:${entity.id}:${payload.event}`;

    await paymentSettlementQueue.add(
      "settle-payment",
      { settlementQueueId },
      {
        jobId,
        attempts: 5,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    console.log(`🧪 Test settlement job added | jobId=${jobId}`);
    return res.json({ status: "job added", jobId, payload });
  } catch (err) {
    console.error("❌ Error adding settlement job:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = app;
