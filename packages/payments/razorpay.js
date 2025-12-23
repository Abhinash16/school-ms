const Razorpay = require("razorpay");
const crypto = require("crypto");

class RazorpayProvider {
  constructor({ key_id, key_secret, webhook_secret }) {
    this.client = new Razorpay({ key_id, key_secret });
    this.webhook_secret = webhook_secret;
  }

  async createPaymentLink({ amount, order_id }) {
    return this.client.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `Payment for Order #${order_id}`,
      reference_id: `ORDER_${order_id}`,
    });
  }

  verifyWebhookSignature(rawBody, signature) {
    const expected = crypto
      .createHmac("sha256", this.webhook_secret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      throw new Error("Invalid Razorpay webhook signature");
    }
  }
}

module.exports = RazorpayProvider;
