const express = require("express");
const classroomLayoutController = require("../controllers/classroomLayout.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");
const router = express.Router();

/* ===============================
   LAYOUT
=============================== */

// Create layout for a classroom
router.post(
  "/classrooms/:classroom_id/layouts",
  authenticateSchool,
  classroomLayoutController.createLayout
);

// Get all layouts for a classroom
router.get(
  "/classrooms/:classroom_id/layouts",
  authenticateSchool,
  classroomLayoutController.getLayouts
);

// Delete a layout
router.delete(
  "/layouts/:layout_id",
  authenticateSchool,
  classroomLayoutController.deleteLayout
);

/* ===============================
   ROWS
=============================== */

// Add row to layout
router.post(
  "/layouts/:layout_id/rows",
  authenticateSchool,
  classroomLayoutController.addRow
);

// Get rows of a layout
router.get(
  "/layouts/:layout_id/rows",
  authenticateSchool,
  classroomLayoutController.getRows
);

// Delete a row
router.delete(
  "/rows/:row_id",
  authenticateSchool,
  classroomLayoutController.deleteRow
);

/* ===============================
   BENCHES
=============================== */

// Add bench to row
router.post(
  "/rows/:row_id/benches",
  authenticateSchool,
  classroomLayoutController.addBench
);

// Get benches of a row
router.get(
  "/rows/:row_id/benches",
  authenticateSchool,
  classroomLayoutController.getBenches
);

// Delete a bench
router.delete(
  "/benches/:bench_id",
  authenticateSchool,
  classroomLayoutController.deleteBench
);

router.post(
  "/benches/:bench_id/students",
  authenticateSchool,
  classroomLayoutController.assignStudents
);

router.delete(
  "/benches/students/:id",
  authenticateSchool,
  classroomLayoutController.removeStudent
);

router.get(
  "/benches/:bench_id/students",
  authenticateSchool,
  classroomLayoutController.getBenchStudents
);

router.post(
  "/layouts/auto-assign",
  authenticateSchool,
  classroomLayoutController.autoAssignStudents
);

module.exports = router;
