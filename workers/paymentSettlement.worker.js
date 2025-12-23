require("dotenv").config();
console.log("ENV Loaded:", process.env.DB_USER, process.env.DB_PASSWORD);

const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const PaymentOrder = require("../packages/db/models/PaymentOrder");
const PaymentSettlementQueue = require("../packages/db/models/PaymentSettlementQueue");
const PaymentTransaction = require("../packages/db/models/PaymentTransaction");

// ==========================
// Redis Connection
// ==========================
const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // REQUIRED for BullMQ
});

// Razorpay final events only
const FINAL_EVENTS = ["payment.captured", "payment_link.paid"];

// ==========================
// Worker Definition
// ==========================
const worker = new Worker(
  "payment-settlement",
  async (job) => {
    const { settlementQueueId } = job.data;

    console.log(
      `\n🟡 [JOB STARTED] jobId=${job.id} settlementQueueId=${settlementQueueId}`
    );

    const settlement = await PaymentSettlementQueue.findByPk(settlementQueueId);

    if (!settlement) {
      console.warn(
        `⚠️ Settlement record not found | settlementQueueId=${settlementQueueId}`
      );
      return;
    }

    console.log(
      `ℹ️ Event=${settlement.event_type} Provider=${settlement.provider} PaymentId=${settlement.gateway_payment_id}`
    );

    // Ignore non-final events
    if (!FINAL_EVENTS.includes(settlement.event_type)) {
      console.log(
        `ℹ️ Non-final event received (${settlement.event_type}), marking SUCCESS`
      );
      await settlement.update({ status: "SUCCESS" });
      return;
    }

    // Already processed
    if (settlement.status !== "PENDING") {
      console.log(
        `🔁 Settlement already processed | status=${settlement.status}`
      );
      return;
    }

    await settlement.update({ status: "PROCESSING" });
    console.log("⚙️ Settlement marked PROCESSING");

    try {
      const payload = settlement.payload;

      const notes =
        payload.payload?.payment?.entity?.notes ||
        payload.payload?.payment_link?.entity?.notes;

      if (!notes?.order_id || !notes?.school_id) {
        throw new Error("Missing order_id or school_id in notes");
      }

      const { order_id, school_id } = notes;

      console.log(
        `🔎 Fetching order | order_id=${order_id} school_id=${school_id}`
      );

      const order = await PaymentOrder.findOne({
        where: { id: order_id, school_id },
      });

      if (!order) throw new Error("Order not found");

      // ==========================
      // Idempotency Check
      // ==========================
      const existingTxn = await PaymentTransaction.findOne({
        where: {
          gateway_payment_id: settlement.gateway_payment_id,
          gateway: settlement.provider,
        },
      });

      if (existingTxn) {
        console.log(
          `🔁 Duplicate payment detected | payment_id=${settlement.gateway_payment_id}`
        );
        await settlement.update({ status: "SUCCESS" });
        return;
      }

      const amount = payload.payload?.payment?.entity?.amount / 100;

      console.log(
        `💰 Creating transaction | amount=${amount} order_id=${order_id}`
      );

      await PaymentTransaction.create({
        order_id,
        school_id,
        amount,
        method: "PG",
        gateway: settlement.provider,
        gateway_payment_id: settlement.gateway_payment_id,
        status: "SUCCESS",
      });

      await order.update({ status: "PAID" });

      await settlement.update({ status: "SUCCESS" });

      console.log(
        `✅ Payment settled successfully | order_id=${order_id} payment_id=${settlement.gateway_payment_id}`
      );
    } catch (err) {
      console.error(
        `❌ Settlement failed | settlementQueueId=${settlementQueueId}`,
        err.message
      );

      await settlement.update({
        status: "FAILED",
        attempts: settlement.attempts + 1,
        last_error: err.message,
      });

      throw err; // let BullMQ retry
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

// ==========================
// Worker Event Logs
// ==========================
worker.on("completed", (job) => {
  console.log(`🎉 [JOB COMPLETED] jobId=${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(
    `🔥 [JOB FAILED] jobId=${job?.id} attempts=${job?.attemptsMade}`,
    err.message
  );
});

worker.on("stalled", (jobId) => {
  console.warn(`⏸️ [JOB STALLED] jobId=${jobId}`);
});

worker.on("error", (err) => {
  console.error("💥 [WORKER ERROR]", err);
});

// ==========================
// Startup Log
// ==========================
console.log(
  `🚀 Payment Settlement Worker Started | Queue=payment-settlement | Redis=${connection.options.host}:${connection.options.port}`
);
