const {
  Book,
  BookIssue,
  Student,
} = require("../../../../../packages/db/models");
const { Op } = require("sequelize");

/**
 * POST /books
 * Add book by class
 */
exports.addBook = async (req, res) => {
  try {
    const { classroom_id, title, author, isbn, quantity } = req.body || {};

    if (!classroom_id || !title) {
      return res
        .status(400)
        .json({ message: "classroom_id and title are required" });
    }

    const book = await Book.create({
      classroom_id,
      title,
      author,
      isbn,
      totalQuantity: quantity || 1,
      availableQuantity: quantity || 1,
    });

    return res.status(201).json({
      message: "Book added successfully",
      data: book,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /books/class/:class_id
 * List books per class
 */
exports.getBooksByClass = async (req, res) => {
  try {
    const { class_id } = req.params;

    const books = await Book.findAll({
      where: { classroom_id: class_id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /books/assign
 * Assign book to student
 */
exports.assignBook = async (req, res) => {
  try {
    const { book_id, student_ids } = req.body;

    if (
      !book_id ||
      !student_ids ||
      !Array.isArray(student_ids) ||
      student_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "book_id and student_ids are required" });
    }

    const book = await Book.findByPk(book_id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.availableQuantity < student_ids.length) {
      return res.status(400).json({
        message: `Only ${book.availableQuantity} copies are available`,
      });
    }

    const createdIssues = [];

    for (const student_id of student_ids) {
      const student = await Student.findByPk(student_id);
      if (!student) continue;

      const issue = await BookIssue.create({
        book_id,
        student_id,
        status: "ISSUED",
      });

      createdIssues.push(issue);
    }

    // Update quantities
    book.availableQuantity -= createdIssues.length;
    book.issuedQuantity += createdIssues.length;
    await book.save();

    return res.status(200).json({
      message: "Book assigned successfully",
      data: createdIssues,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /books/return/:issue_id
 * Return book
 */
exports.returnBook = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const issue = await BookIssue.findOne({
      where: { id: issue_id, status: "ISSUED" },
    });

    if (!issue)
      return res.status(404).json({ message: "Active book issue not found" });

    await issue.update({ status: "RETURNED", return_date: new Date() });

    const book = await Book.findByPk(issue.book_id);
    book.availableQuantity += 1;
    book.issuedQuantity -= 1;
    await book.save();

    return res.status(200).json({ message: "Book returned successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
