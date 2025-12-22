// packages/payments/razorpay.js
const Razorpay = require("razorpay");

class RazorpayProvider {
  constructor({ key_id, key_secret }) {
    this.client = new Razorpay({ key_id, key_secret });
  }

  async createPaymentLink({ amount, order_id }) {
    return this.client.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `Payment for Order #${order_id}`,
      reference_id: `ORDER_${order_id}`,
    });
  }
}

module.exports = RazorpayProvider;
