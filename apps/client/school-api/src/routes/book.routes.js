const express = require("express");
const router = express.Router();

const BookController = require("../controllers/book.controller");
const { authenticateSchool } = require("../middlewares/auth.middleware");

/**
 * Book Routes
 */
router.post("/", BookController.addBook);
router.get("/class/:class_id", BookController.getBooksByClass);
router.post("/assign", BookController.assignBook);
router.post("/return/:issue_id", BookController.returnBook);

module.exports = router;
