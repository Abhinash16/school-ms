const express = require("express");
const router = express.Router();

const controller = require("../controllers/schoolPaymentGateway.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

router.use(authenticateSchool);

router.post("/", controller.upsertGateway);
router.get("/", controller.listGateways);
router.patch("/:provider/disable", controller.disableGateway);

module.exports = router;
