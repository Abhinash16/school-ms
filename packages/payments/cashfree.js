// packages/payments/cashfree.js
const axios = require("axios");

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

  async createPaymentLink({ amount, order_id }) {
    const { data } = await this.client.post("/links", {
      link_amount: amount,
      link_currency: "INR",
      link_reference_id: `ORDER_${order_id}`,
      link_purpose: `Payment for Order #${order_id}`,
    });

    return data;
  }
}

module.exports = CashfreeProvider;
