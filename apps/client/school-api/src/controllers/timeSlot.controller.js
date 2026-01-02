const { sequelize } = require("../../../../../packages/db");
const TimeSlot = require("../../../../../packages/db/models/TimeSlot");

module.exports = {
  async createTimeSlot(req, res) {
    try {
      const { start_time, end_time } = req.body;
      const { id: school_id } = req.school;

      if (!start_time || !end_time) {
        return res.status(400).json({
          success: false,
          message: "start_time, end_time and order are required",
        });
      }

      const slot = await TimeSlot.create({
        school_id,
        start_time,
        end_time,
      });

      return res.json({
        success: true,
        data: slot,
      });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Time slot already exists for this school",
        });
      }

      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  async bulkUpsert(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { slots } = req.body;
      const { id: school_id } = req.school;

      if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({
          success: false,
          message: "slots array is required",
        });
      }

      // 1️⃣ Get existing slots
      const existingSlots = await TimeSlot.findAll({
        where: { school_id },
        attributes: ["start_time", "end_time"],
        transaction,
      });

      const existingSet = new Set(
        existingSlots.map((s) => `${s.start_time}-${s.end_time}`)
      );

      // 2️⃣ Filter new slots
      const toInsert = slots
        .filter((s) => s.start_time && s.end_time)
        .filter((s) => !existingSet.has(`${s.start_time}-${s.end_time}`))
        .map((s) => ({
          school_id,
          start_time: s.start_time,
          end_time: s.end_time,
        }));

      // 3️⃣ Bulk insert (ignore duplicates safety net)
      if (toInsert.length > 0) {
        await TimeSlot.bulkCreate(toInsert, {
          transaction,
          ignoreDuplicates: true,
        });
      }

      await transaction.commit();

      return res.json({
        success: true,
        summary: {
          requested: slots.length,
          inserted: toInsert.length,
          skipped: slots.length - toInsert.length,
        },
      });
    } catch (err) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // controllers/timeSlotController.js

  async updateTimeSlot(req, res) {
    try {
      const { id } = req.params;
      const { start_time, end_time } = req.body;
      const { id: school_id } = req.school;

      if (!start_time || !end_time) {
        return res.status(400).json({
          success: false,
          message: "start_time and end_time are required",
        });
      }

      const slot = await TimeSlot.findOne({
        where: { id, school_id },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Time slot not found",
        });
      }

      await slot.update({ start_time, end_time });

      return res.json({
        success: true,
        data: slot,
      });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Time slot already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  async deleteTimeSlot(req, res) {
    try {
      const { id } = req.params;
      const { id: school_id } = req.school;

      const slot = await TimeSlot.findOne({
        where: { id, school_id },
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Time slot not found",
        });
      }

      await slot.destroy();

      return res.json({
        success: true,
        message: "Time slot deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  async getTimeSlots(req, res) {
    try {
      const { id: school_id } = req.school;

      const slots = await TimeSlot.findAll({
        where: { school_id },
        order: [["start_time", "ASC"]],
      });

      return res.json({
        success: true,
        data: slots,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
};
