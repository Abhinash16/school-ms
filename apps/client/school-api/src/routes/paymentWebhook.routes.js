const express = require("express");
const router = express.Router();
const paymentWebhookController = require("../controllers/paymentWebhook.controller");

// RAW BODY REQUIRED
router.post("/razorpay", paymentWebhookController.razorpayWebhook);

router.post("/cashfree", paymentWebhookController.cashfreeWebhook);

module.exports = router;
