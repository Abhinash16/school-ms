const express = require("express");
const router = express.Router();
const paymentOrderController = require("../controllers/paymentOrder.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

router.use(authenticateSchool);
router.post("/", paymentOrderController.createOrder);
router.post("/:order_id/mark-paid", paymentOrderController.markOrderPaid);
router.post(
  "/:order_id/payment-link",
  paymentOrderController.createPaymentLink
);

module.exports = router;
