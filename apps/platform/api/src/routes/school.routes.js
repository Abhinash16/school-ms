// apps/platform/api/src/routes/school.routes.js
const express = require("express");
const router = express.Router();

const SchoolController = require("../controllers/school.controller");

// POST → onboard a school
router.post("/", SchoolController.createSchool);

// GET → list schools
router.get("/", SchoolController.listSchools);

module.exports = router;
