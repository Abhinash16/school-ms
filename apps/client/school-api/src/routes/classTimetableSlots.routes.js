const express = require("express");
const { authenticateSchool } = require("../middlewares/auth.middleware");
const classTimetableSlotController = require("../controllers/classTimetableSlot.controller");
const router = express.Router();

router.post("/", authenticateSchool, classTimetableSlotController.assignSlot);
router.delete(
  "/:id",
  authenticateSchool,
  classTimetableSlotController.removeSlot
);
router.post(
  "/bulk",
  authenticateSchool,
  classTimetableSlotController.bulkAssignSlots
);

module.exports = router;
