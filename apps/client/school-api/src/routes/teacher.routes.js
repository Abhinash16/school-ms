const teacherController = require("../controllers/teacher.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.post("/", authenticateSchool, teacherController.addTeacher);
router.post("/bulk", authenticateSchool, teacherController.bulkAddTeachers);
router.get("/", authenticateSchool, teacherController.getTeachers);
router.put("/:id", authenticateSchool, teacherController.updateTeacher);

module.exports = router;
