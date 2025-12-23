const { Sequelize } = require("sequelize");
const {
  PaymentSettlementQueue,
  SchoolPaymentGateway,
} = require("../../../../../packages/db/models");
const RazorpayProvider = require("../../../../../packages/payments/razorpay");
const paymentSettlementQueue = require("../../../../../queues/paymentSettlement.queue");

module.exports = {
  async razorpayWebhook(req, res) {
    try {
      const signature = req.headers["x-razorpay-signature"];
      if (!signature) {
        return res.status(400).json({ error: "Signature missing" });
      }

      const payload = req.body; // express.raw
      if (!payload) {
        return res.status(400).json({ error: "Payload missing" });
      }

      const entity =
        payload.payload?.payment?.entity ||
        payload.payload?.payment_link?.entity;

      if (!entity?.notes?.school_id) {
        return res.status(200).json({ message: "No school ID, ignoring" });
      }

      const gateway = await SchoolPaymentGateway.findOne({
        where: {
          school_id: entity.notes.school_id,
          provider: "RAZORPAY",
          enabled: true,
        },
      });

      if (
        !gateway ||
        !gateway.credentials?.key_id ||
        !gateway.credentials?.key_secret ||
        !gateway.credentials?.webhook_secret
      ) {
        console.warn(
          `Razorpay gateway config incomplete for school: ${entity.notes.school_id}`
        );
        return res.status(200).json({
          message: "Gateway config incomplete, ignoring",
        });
      }

      const razorpay = new RazorpayProvider({
        key_id: gateway.credentials.key_id,
        key_secret: gateway.credentials.key_secret,
        webhook_secret: gateway.credentials.webhook_secret,
      });

      try {
        await razorpay.verifyWebhookSignature(
          JSON.stringify(payload),
          signature
        );
      } catch (err) {
        console.warn("Webhook verification failed:", err.message);
        return res.status(200).json({ message: "Invalid signature, ignoring" });
      }

      let settlement;

      try {
        settlement = await PaymentSettlementQueue.create({
          provider: "RAZORPAY",
          event_type: payload.event,
          gateway_payment_id: entity.id,

          order_id: entity.notes.order_id,
          school_id: entity.notes.school_id,

          reference: entity.notes,
          payload,
        });
      } catch (err) {
        if (err instanceof Sequelize.UniqueConstraintError) {
          console.log(
            `🔁 Duplicate Razorpay webhook ignored | payment_id=${entity.id} | event=${payload.event}`
          );
          return res.sendStatus(200);
        }
        throw err;
      }

      // 🚀 Push to worker immediately
      await paymentSettlementQueue.add(
        "settle-payment",
        {
          settlementQueueId: settlement.id,
        },
        {
          jobId: `${settlement.provider}:${settlement.gateway_payment_id}:${settlement.event_type}`,
        }
      );

      return res
        .status(200)
        .json({ message: "Webhook processed successfully" });
    } catch (err) {
      console.error("Razorpay webhook error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  async cashfreeWebhook(req, res) {
    try {
      const payload = req.body;

      await PaymentSettlementQueue.create({
        provider: "CASHFREE",
        event_type: payload.type,
        gateway_payment_id: payload.data.payment.cf_payment_id,
        reference: payload.data.order.order_note,
        payload,
      });

      return res.sendStatus(200);
    } catch (err) {
      console.error("Cashfree webhook:", err.message);
      return res.sendStatus(400);
    }
  },
};
