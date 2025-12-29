const express = require("express");
const { authenticateSchool } = require("../middlewares/auth.middleware");
const subjectController = require("../controllers/subject.controller");
const router = express.Router();

router.post("/", authenticateSchool, subjectController.createSubject);
router.get("/", authenticateSchool, subjectController.getSubjects);
router.post("/bulk", authenticateSchool, subjectController.bulkCreateSubjects);

module.exports = router;
