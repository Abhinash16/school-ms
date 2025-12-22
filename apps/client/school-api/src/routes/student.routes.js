const express = require("express");
const router = express.Router();
const StudentController = require("../controllers/student.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

router.post("/", authenticateSchool, StudentController.createStudent);
router.get("/", authenticateSchool, StudentController.listStudents);
router.get(
  "/class/:class_id",
  authenticateSchool,
  StudentController.getStudentsByClass
);
router.get("/:id", authenticateSchool, StudentController.getStudentById);

module.exports = router;
