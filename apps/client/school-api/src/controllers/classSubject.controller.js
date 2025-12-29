const ClassSubject = require("../../../../../packages/db/models/ClassSubject");

module.exports = {
  /**
   * Assign single subject to classroom
   */
  async assignSubject(req, res) {
    try {
      const { classroom_id, subject_id, teacher_id } = req.body;
      const { id: school_id } = req.school;
      if (!classroom_id || !subject_id) {
        return res.status(400).json({
          success: false,
          message: "classroom_id and subject_id are required",
        });
      }

      const record = await ClassSubject.create({
        school_id,
        classroom_id,
        subject_id,
        teacher_id: teacher_id || null,
      });

      return res.json({ success: true, data: record });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Subject already assigned to this classroom",
        });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Bulk assign subjects
   */
  async bulkAssignSubjects(req, res) {
    try {
      const { classroom_id, subjects } = req.body;
      if (!classroom_id || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({
          success: false,
          message: "classroom_id and subjects array are required",
        });
      }
      const { id: school_id } = req.school;

      // Map payload
      const payload = subjects.map((s) => ({
        classroom_id,
        subject_id: s.subject_id,
        teacher_id: s.teacher_id || null,
        school_id,
      }));

      // Use bulkCreate with ignoreDuplicates
      await ClassSubject.bulkCreate(payload, { ignoreDuplicates: true });

      const allRecords = await ClassSubject.findAll({
        where: { classroom_id },
      });

      return res.json({ success: true, data: allRecords });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Get all subjects for a classroom
   */
  async getClassSubjects(req, res) {
    try {
      const { classroom_id } = req.query;
      const { id: school_id } = req.school;
      const data = await ClassSubject.findAll({
        where: { classroom_id, school_id },
        include: ["Subject", "Teacher"], // Optional: include associations
      });

      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
