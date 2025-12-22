const { Student } = require("../../../../../packages/db/models");

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
      } = req.body;

      const student = await Student.create({
        first_name,
        last_name,
        email,
        phone,
        classroom_id,
        school_id,
        admission_no,
      });

      res.status(201).json({ success: true, data: student });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
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
};
