const express = require("express");
const { authenticateSchool } = require("../middlewares/auth.middleware");
const timeSlotController = require("../controllers/timeSlot.controller");
const router = express.Router();

router.post("/", authenticateSchool, timeSlotController.createTimeSlot);
router.get("/", authenticateSchool, timeSlotController.getTimeSlots);
router.post("/bulk", authenticateSchool, timeSlotController.bulkUpsert);
router.put("/:id", authenticateSchool, timeSlotController.updateTimeSlot);
router.delete("/:id", authenticateSchool, timeSlotController.deleteTimeSlot);

module.exports = router;
