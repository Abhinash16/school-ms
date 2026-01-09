const express = require("express");
const noticeController = require("../controllers/notice.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

const router = express.Router();

/* ===============================
   NOTICES
=============================== */

/**
 * Create a notice and assign it to:
 * - whole school
 * - one or more classes
 * - one or more students
 */
router.post("/notices", authenticateSchool, noticeController.createNotice);

/**
 * Get notices visible to a classroom
 * (school-wide + class-specific)
 */
router.get(
  "/classrooms/:classroom_id/notices",
  authenticateSchool,
  noticeController.getClassNotices
);

/**
 * Get notices visible to a student
 * (school + class + student)
 */
router.get(
  "/students/:student_id/notices",
  authenticateSchool,
  noticeController.getStudentNotices
);

/**
 * Update notice content
 */
router.put(
  "/notices/:notice_id",
  authenticateSchool,
  noticeController.updateNotice
);

/**
 * Delete notice
 */
router.delete(
  "/notices/:notice_id",
  authenticateSchool,
  noticeController.deleteNotice
);

module.exports = router;
