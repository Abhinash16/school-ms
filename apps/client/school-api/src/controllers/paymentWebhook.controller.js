const RazorpayProvider = require("../../../../../packages/payments/razorpay");
const CashfreeProvider = require("../../../../../packages/payments/cashfree");
const {
  PaymentOrder,
  PaymentTransaction,
  SchoolPaymentGateway,
} = require("../../../../../packages/db/models");

module.exports = {
  async razorpayWebhook(req, res) {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const payload = req.body;

      const event = payload;

      const referenceId =
        event.payload?.payment?.entity?.notes?.reference_id ||
        event.payload?.payment_link?.entity?.reference_id;

      if (!referenceId) return res.sendStatus(200);

      const orderId = referenceId.replace("ORDER_", "");

      const order = await PaymentOrder.findByPk(orderId);
      if (!order) return res.sendStatus(200);

      const config = await SchoolPaymentGateway.findOne({
        where: { school_id: order.school_id, provider: "RAZORPAY" },
      });

      const razorpay = new RazorpayProvider(config);
      razorpay.verifyWebhookSignature(payload, signature);

      // Idempotency check
      const exists = await PaymentTransaction.findOne({
        where: { transaction_id: event.payload.payment.entity.id },
      });
      if (exists) return res.sendStatus(200);

      await PaymentTransaction.create({
        order_id: order.id,
        paid_amount: event.payload.payment.entity.amount / 100,
        payment_method: "GATEWAY",
        transaction_id: event.payload.payment.entity.id,
        status: "SUCCESS",
      });

      await order.update({ status: "PAID" });

      return res.sendStatus(200);
    } catch (err) {
      console.error("Razorpay webhook error:", err.message);
      return res.sendStatus(400);
    }
  },
  async cashfreeWebhook(req, res) {
    try {
      const signature = req.headers["x-cf-signature"];
      const timestamp = req.headers["x-cf-timestamp"];
      const payload = req.body;

      const event = payload;
      const orderId = event.data.order.order_id;

      const order = await PaymentOrder.findByPk(orderId);
      if (!order) return res.sendStatus(200);

      const config = await SchoolPaymentGateway.findOne({
        where: { school_id: order.school_id, provider: "CASHFREE" },
      });

      const cashfree = new CashfreeProvider(config);
      cashfree.verifyWebhookSignature(payload, signature, timestamp);

      const exists = await PaymentTransaction.findOne({
        where: { transaction_id: event.data.payment.cf_payment_id },
      });
      if (exists) return res.sendStatus(200);

      await PaymentTransaction.create({
        order_id: order.id,
        paid_amount: event.data.payment.payment_amount,
        payment_method: "GATEWAY",
        transaction_id: event.data.payment.cf_payment_id,
        status: "SUCCESS",
      });

      await order.update({ status: "PAID" });

      return res.sendStatus(200);
    } catch (err) {
      console.error("Cashfree webhook error:", err.message);
      return res.sendStatus(400);
    }
  },
};
