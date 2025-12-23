const Razorpay = require("razorpay");
const crypto = require("crypto");

class RazorpayProvider {
  constructor({ key_id, key_secret, webhook_secret }) {
    this.client = new Razorpay({ key_id, key_secret });
    this.webhook_secret = webhook_secret;
  }

  async createPaymentLink({ amount, notes }) {
    if (!notes?.order_id || !notes?.school_id) {
      throw new Error("notes must include order_id and school_id");
    }
    return this.client.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `Payment for Order #${notes.order_id}`,
      notes,
    });
  }

  async verifyWebhookSignature(rawBody, signature) {
    if (!this.webhook_secret) {
      throw new Error("Webhook secret not set for Razorpay provider");
    }
    if (!rawBody || !signature) {
      throw new Error("Raw body and signature are required to verify webhook");
    }

    const expectedSignature = crypto
      .createHmac("sha256", this.webhook_secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid Razorpay webhook signature");
    }

    return true; // verification passed
  }
}

module.exports = RazorpayProvider;
