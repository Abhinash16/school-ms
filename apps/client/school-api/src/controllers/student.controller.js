const {
  Student,
  PaymentOrder,
  PaymentOrderLineItem,
  PaymentTransaction,
} = require("../../../../../packages/db/models");
const handleSQLError = require("../utils/sqlErrorHandler");

module.exports = {
  async createStudent(req, res) {
    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        classroom_id,
        school_id,
        admission_no,
        dob,
        gender,
        roll_no,
      } = req.body;

      const student = await Student.create({
        first_name,
        last_name,
        email,
        phone,
        classroom_id,
        school_id,
        admission_no,
        dob,
        gender,
        roll_no,
      });

      res.status(201).json({ success: true, data: student });
    } catch (err) {
      const errorResponse = handleSQLError(err);
      return res.status(500).json(errorResponse);
    }
  },

  async listStudents(req, res) {
    try {
      const students = await Student.findAll();
      res.json({ success: true, data: students });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get students by class_id
  async getStudentsByClass(req, res) {
    try {
      const { class_id } = req.params;

      const students = await Student.findAll({
        where: { classroom_id: class_id, school_id: req.school.id },
      });

      res.json({ success: true, data: students });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get single student by id
  async getStudentById(req, res) {
    try {
      const { id } = req.params;

      const student = await Student.findOne({
        where: { id, school_id: req.school.id },
      });

      if (!student)
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });

      res.json({ success: true, data: student });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get payment details for a single student
  async getStudentPayments(req, res) {
    try {
      const { id } = req.params;

      // Check if student exists
      const student = await Student.findOne({
        where: { id, school_id: req.school.id },
      });

      if (!student)
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });

      // Fetch all payment orders and transactions for this student
      const paymentOrders = await PaymentOrder.findAll({
        where: { student_id: id },
        include: [
          {
            model: PaymentOrderLineItem,
            as: "PaymentOrderLineItems",
          },
          {
            model: PaymentTransaction,
            as: "PaymentTransactions",
          },
        ],
      });

      res.json({
        success: true,
        data: {
          student,
          paymentOrders,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const {
        first_name,
        last_name,
        email,
        phone,
        dob,
        gender,
        classroom_id,
        admission_no,
      } = req.body;

      // Find student
      const student = await Student.findOne({
        where: { id, school_id: req.school.id },
      });

      if (!student)
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });

      // Update fields if provided
      student.first_name = first_name ?? student.first_name;
      student.last_name = last_name ?? student.last_name;
      student.email = email ?? student.email;
      student.phone = phone ?? student.phone;
      student.classroom_id = classroom_id ?? student.classroom_id;
      student.admission_no = admission_no ?? student.admission_no;
      student.dob = dob ?? student.dob;
      student.gender = gender ?? student.gender;

      await student.save();

      res.json({ success: true, data: student });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
