const express = require("express");
const { authenticateSchool } = require("../middlewares/auth.middleware");
const classTimetableController = require("../controllers/classTimetable.controller");
const router = express.Router();

router.post("/", authenticateSchool, classTimetableController.createOrGet);
router.get("/", authenticateSchool, classTimetableController.getByClass);
router.post("/bulk", authenticateSchool, classTimetableController.bulkCreate);
router.get(
  "/time-table",
  authenticateSchool,
  classTimetableController.getClassTimetable
);

module.exports = router;
