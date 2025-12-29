const Subject = require("../../../../../packages/db/models/Subject");

module.exports = {
  /**
   * Create single subject
   */
  async createSubject(req, res) {
    try {
      const { name, type } = req.body;
      const { id: school_id } = req.school;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: "Name and type are required",
        });
      }

      const subject = await Subject.create({
        school_id,
        name: name.trim(),
        type,
      });

      return res.json({ success: true, data: subject });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Subject already exists for your school",
        });
      }
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Get all subjects
   */
  async getSubjects(req, res) {
    try {
      const { id: school_id } = req.school;

      const subjects = await Subject.findAll({
        where: { school_id },
        order: [
          ["type", "ASC"],
          ["name", "ASC"],
        ],
      });

      return res.json({ success: true, data: subjects });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Bulk create subjects
   * - ignore duplicates
   */
  async bulkCreateSubjects(req, res) {
    try {
      const { subjects } = req.body; // expects [{ name, type }, ...]

      const { id: school_id } = req.school;

      if (!Array.isArray(subjects) || !subjects.length) {
        return res.status(400).json({
          success: false,
          message: "subjects array is required",
        });
      }

      const payload = subjects.map((s) => ({
        school_id,
        name: s.name.trim(),
        type: s.type,
      }));

      await Subject.bulkCreate(payload, { ignoreDuplicates: true });

      const allSubjects = await Subject.findAll({
        where: { school_id },
        order: [
          ["type", "ASC"],
          ["name", "ASC"],
        ],
      });

      return res.json({ success: true, data: allSubjects });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
