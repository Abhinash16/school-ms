// packages/payments/cashfree.js
const axios = require("axios");
const crypto = require("crypto");

class CashfreeProvider {
  constructor({ app_id, secret_key }) {
    this.client = axios.create({
      baseURL: "https://api.cashfree.com/pg",
      headers: {
        "x-client-id": app_id,
        "x-client-secret": secret_key,
      },
    });
  }

  async createPaymentLink({ amount, notes }) {
    if (!notes?.order_id || !notes?.school_id) {
      throw new Error("notes must include order_id and school_id");
    }
    const { data } = await this.client.post("/links", {
      link_amount: amount,
      link_currency: "INR",
      link_purpose: `Payment for Order #${notes.order_id}`,
      link_notes: notes,
    });

    return data;
  }

  verifyWebhookSignature(rawBody, signature, timestamp) {
    const data = rawBody + timestamp;

    const expected = crypto
      .createHmac("sha256", this.webhook_secret)
      .update(data)
      .digest("base64");

    if (expected !== signature) {
      throw new Error("Invalid Cashfree webhook signature");
    }
  }
}

module.exports = CashfreeProvider;
