const ClassTimetable = require("../../../../../packages/db/models/ClassTimetable");
const ClassTimetableSlot = require("../../../../../packages/db/models/ClassTimetableSlot");

module.exports = {
  /**
   * Assign a single slot (idempotent)
   */
  async assignSlot(req, res) {
    try {
      const {
        classroom_id,
        day_of_week,
        time_slot_id,
        class_subject_id,
        label,
      } = req.body;
      const { id: school_id } = req.school;

      if (!classroom_id || !day_of_week || !time_slot_id || !class_subject_id) {
        return res.status(400).json({
          success: false,
          message:
            "classroom_id, day_of_week, time_slot_id, class_subject_id are required",
        });
      }

      // Find the timetable for the classroom/day
      const timetable = await ClassTimetable.findOne({
        where: { school_id, classroom_id, day_of_week },
      });

      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: "Timetable not found for this classroom/day",
        });
      }

      // Try to find existing slot
      let slot = await ClassTimetableSlot.findOne({
        where: {
          school_id,
          class_timetable_id: timetable.id,
          time_slot_id,
        },
      });

      if (slot) {
        // If exists, update class_subject_id and label
        await slot.update({ class_subject_id, label });
      } else {
        // If not exists, create a new slot
        slot = await ClassTimetableSlot.create({
          school_id,
          class_timetable_id: timetable.id,
          time_slot_id,
          class_subject_id,
          label,
        });
      }

      return res.json({
        success: true,
        data: slot,
      });
    } catch (err) {
      console.error("assignSlot error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  /**
   * Bulk assign slots (safe + idempotent)
   */
  async bulkAssignSlots(req, res) {
    try {
      const { classroom_id, day_of_week, slots } = req.body;
      const { id: school_id } = req.school;

      if (
        !classroom_id ||
        !day_of_week ||
        !Array.isArray(slots) ||
        !slots.length
      ) {
        return res.status(400).json({
          success: false,
          message: "classroom_id, day_of_week and slots[] are required",
        });
      }

      const timetable = await ClassTimetable.findOne({
        where: { school_id, classroom_id, day_of_week },
      });

      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: "Timetable not found for this classroom/day",
        });
      }

      const payload = slots.map((s) => ({
        school_id,
        class_timetable_id: timetable.id,
        time_slot_id: s.time_slot_id,
        class_subject_id: s.class_subject_id,
      }));

      await ClassTimetableSlot.bulkCreate(payload, {
        ignoreDuplicates: true, // 🔥 critical
      });

      const data = await ClassTimetableSlot.findAll({
        where: {
          school_id,
          class_timetable_id: timetable.id,
        },
        order: [["time_slot_id", "ASC"]],
      });

      return res.json({
        success: true,
        data,
      });
    } catch (err) {
      console.error("bulkAssignSlots error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  /**
   * Remove a slot safely
   */
  async removeSlot(req, res) {
    try {
      const { id } = req.params;
      const { id: school_id } = req.school;

      const deleted = await ClassTimetableSlot.destroy({
        where: { id, school_id },
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      return res.json({
        success: true,
        message: "Slot removed",
      });
    } catch (err) {
      console.error("removeSlot error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
};
