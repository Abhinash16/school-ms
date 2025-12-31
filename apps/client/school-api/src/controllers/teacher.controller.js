const Teacher = require("../../../../../packages/db/models/Teacher");

module.exports = {
  /**
   * Add single teacher
   */
  async addTeacher(req, res) {
    try {
      const { name, email, phone, status } = req.body;
      const { id: school_id } = req.school;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      const teacher = await Teacher.create({
        school_id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        status: status || "ACTIVE",
      });

      return res.json({ success: true, data: teacher });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Email or phone already exists",
        });
      }

      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Bulk add teachers
   */
  async bulkAddTeachers(req, res) {
    try {
      const { teachers } = req.body;
      const { id: school_id } = req.school;

      if (!Array.isArray(teachers) || !teachers.length) {
        return res.status(400).json({
          success: false,
          message: "teachers array is required",
        });
      }

      const payload = teachers.map((t) => ({
        school_id,
        name: t.name.trim(),
        email: t.email?.trim() || null,
        phone: t.phone?.trim() || null,
        status: t.status || "ACTIVE",
      }));

      await Teacher.bulkCreate(payload, { ignoreDuplicates: true });

      const allTeachers = await Teacher.findAll({
        where: { school_id },
        order: [["name", "ASC"]],
      });

      return res.json({ success: true, data: allTeachers });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Get all teachers for the school
   */
  async getTeachers(req, res) {
    try {
      const { id: school_id } = req.school;

      const teachers = await Teacher.findAll({
        where: { school_id },
        order: [["name", "ASC"]],
      });

      return res.json({ success: true, data: teachers });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Update single teacher
   */
  async updateTeacher(req, res) {
    try {
      const { id } = req.params; // teacher id
      const { name, email, phone, status } = req.body;
      const { id: school_id } = req.school;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Teacher id is required",
        });
      }

      const teacher = await Teacher.findOne({
        where: { id, school_id },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // Update only provided fields
      if (name !== undefined) teacher.name = name.trim();
      if (email !== undefined) teacher.email = email?.trim() || null;
      if (phone !== undefined) teacher.phone = phone?.trim() || null;
      if (status !== undefined) teacher.status = status;

      await teacher.save();

      return res.json({
        success: true,
        data: teacher,
        message: "Teacher updated successfully",
      });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Email or phone already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
};
