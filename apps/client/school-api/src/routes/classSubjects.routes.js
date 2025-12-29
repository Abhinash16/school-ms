const express = require("express");
const { authenticateSchool } = require("../middlewares/auth.middleware");
const classSubjectController = require("../controllers/classSubject.controller");
const router = express.Router();

router.post("/", authenticateSchool, classSubjectController.assignSubject);
router.get("/", authenticateSchool, classSubjectController.getClassSubjects);
router.post(
  "/bulk",
  authenticateSchool,
  classSubjectController.bulkAssignSubjects
);

module.exports = router;
