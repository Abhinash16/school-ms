const express = require("express");
const router = express.Router();
const ClassroomController = require("../controllers/classroom.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

router.post("/", authenticateSchool, ClassroomController.createClassroom);
router.get("/", authenticateSchool, ClassroomController.listClassrooms);

module.exports = router;
