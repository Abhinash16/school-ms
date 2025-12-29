const { Classroom } = require("../../../../../packages/db/models");

module.exports = {
  async createClassroom(req, res) {
    try {
      const { name, code, grade, section, academic_year } = req.body;

      if (!req.school?.id)
        return res
          .status(400)
          .json({ success: false, message: "School not found in JWT" });

      const classroom = await Classroom.create({
        name,
        code,
        grade,
        section,
        academic_year,
        school_id: req.school.id, // ✅ assign school
      });

      res.status(201).json({ success: true, data: classroom });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async listClassrooms(req, res) {
    try {
      const classrooms = await Classroom.findAll({
        where: { school_id: req.school.id }, // only return this school
      });
      res.json({ success: true, data: classrooms });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ Get Classroom by ID
  async getClassroomById(req, res) {
    try {
      const { id } = req.params;

      // Make sure the classroom belongs to the school
      const classroom = await Classroom.findOne({
        where: { id, school_id: req.school.id },
      });

      if (!classroom)
        return res
          .status(404)
          .json({ success: false, message: "Classroom not found" });

      res.json({ success: true, data: classroom });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
