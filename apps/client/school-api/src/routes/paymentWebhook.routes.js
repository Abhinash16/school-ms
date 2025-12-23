const express = require("express");
const router = express.Router();
const paymentWebhookController = require("../controllers/paymentWebhook.controller");

// RAW BODY REQUIRED
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  paymentWebhookController.razorpayWebhook
);

router.post(
  "/cashfree",
  express.raw({ type: "application/json" }),
  paymentWebhookController.cashfreeWebhook
);

module.exports = router;
