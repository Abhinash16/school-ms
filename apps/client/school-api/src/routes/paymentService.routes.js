const express = require("express");
const router = express.Router();

const paymentServiceController = require("../controllers/paymentService.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(authenticateSchool);

router.post("/", paymentServiceController.createPaymentService);
router.get("/", paymentServiceController.listPaymentServices);
router.get("/:id", paymentServiceController.getPaymentService);

module.exports = router;
