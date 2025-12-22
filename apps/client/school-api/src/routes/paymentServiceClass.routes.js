const express = require("express");
const router = express.Router();
const controller = require("../controllers/paymentServiceClass.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

// Auth middleware
router.use(authenticateSchool);

// Assign service to classes
router.post("/", controller.assignServiceToClasses);

// List assignments (optional service_id filter)
router.get("/", controller.listServiceClasses);

module.exports = router;
