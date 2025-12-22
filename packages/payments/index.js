const RazorpayProvider = require("./razorpay");
const CashfreeProvider = require("./cashfree");

function getPaymentProvider(provider, credentials) {
  switch (provider) {
    case "RAZORPAY":
      return new RazorpayProvider(credentials);
    case "CASHFREE":
      return new CashfreeProvider(credentials);
    default:
      throw new Error("Unsupported payment provider");
  }
}
module.exports = {
  getPaymentProvider,
};
