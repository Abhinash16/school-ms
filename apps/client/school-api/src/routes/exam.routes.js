const express = require("express");
const router = express.Router();

const {
  createExam,
  getAllExams,
  getExamById,
  getExamsByClass,
  assignClasses,
  addSubject,
  submitMarks,
  getResult,
} = require("../controllers/exam.controller");

const { authenticateSchool } = require("../middlewares/auth.middleware");

router.post("/", authenticateSchool, createExam);
router.get("/", authenticateSchool, getAllExams);
router.get("/:id", authenticateSchool, getExamById);
router.get("/class/:id", authenticateSchool, getExamsByClass);
router.post("/:examId/classes", authenticateSchool, assignClasses);
router.post("/:examId/subjects", authenticateSchool, addSubject);
router.post("/marks", authenticateSchool, submitMarks);
router.get("/result", authenticateSchool, getResult);

module.exports = router;
