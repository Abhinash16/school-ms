const ClassSubject = require("../../../../../packages/db/models/ClassSubject");
const ClassTimetable = require("../../../../../packages/db/models/ClassTimetable");
const ClassTimetableSlot = require("../../../../../packages/db/models/ClassTimetableSlot");
const Subject = require("../../../../../packages/db/models/Subject");
const Teacher = require("../../../../../packages/db/models/Teacher");
const TimeSlot = require("../../../../../packages/db/models/TimeSlot");
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

module.exports = {
  /**
   * Create or get a timetable for a classroom + day
   * (Idempotent API)
   */
  async createOrGet(req, res) {
    try {
      const { classroom_id, day_of_week } = req.body;
      const { id: school_id } = req.school;

      if (!classroom_id || !day_of_week) {
        return res.status(400).json({
          success: false,
          message: "classroom_id and day_of_week are required",
        });
      }

      const [record] = await ClassTimetable.findOrCreate({
        where: {
          school_id,
          classroom_id,
          day_of_week,
        },
      });

      return res.json({
        success: true,
        data: record,
      });
    } catch (err) {
      console.error("ClassTimetable createOrGet error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  /**
   * Bulk create timetables for a classroom
   * Existing ones remain unchanged
   */
  async bulkCreate(req, res) {
    try {
      const { classroom_id, days } = req.body;
      const { id: school_id } = req.school;

      if (!classroom_id || !Array.isArray(days) || !days.length) {
        return res.status(400).json({
          success: false,
          message: "classroom_id and days[] are required",
        });
      }

      const payload = days.map((day) => ({
        school_id,
        classroom_id,
        day_of_week: day,
      }));

      await ClassTimetable.bulkCreate(payload, {
        ignoreDuplicates: true, // important
      });

      const records = await ClassTimetable.findAll({
        where: { school_id, classroom_id },
        order: [["day_of_week", "ASC"]],
      });

      return res.json({
        success: true,
        data: records,
      });
    } catch (err) {
      console.error("ClassTimetable bulkCreate error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  /**
   * Get timetables by classroom
   */
  async getByClass(req, res) {
    try {
      const { classroom_id } = req.query;
      const { id: school_id } = req.school;

      if (!classroom_id) {
        return res.status(400).json({
          success: false,
          message: "classroom_id is required",
        });
      }

      const data = await ClassTimetable.findAll({
        where: { school_id, classroom_id },
        order: [["day_of_week", "ASC"]],
      });

      return res.json({
        success: true,
        data,
      });
    } catch (err) {
      console.error("ClassTimetable getByClass error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  async getClassTimetable(req, res) {
    try {
      const { classroom_id } = req.query;
      const { id: school_id } = req.school;

      if (!classroom_id) {
        return res.status(400).json({
          success: false,
          message: "classroom_id is required",
        });
      }

      // 1️⃣ Fetch ALL time slots (master)
      const allTimeSlots = await TimeSlot.findAll({
        attributes: ["id", "start_time", "end_time"],
        order: [["start_time", "ASC"]],
      });

      // 2️⃣ Fetch timetable + slots
      const timetables = await ClassTimetable.findAll({
        where: { classroom_id, school_id },
        attributes: ["id", "day_of_week"],
        include: [
          {
            model: ClassTimetableSlot,
            attributes: ["time_slot_id"],
            include: [
              {
                model: TimeSlot,
                attributes: ["id", "start_time", "end_time"],
              },
              {
                model: ClassSubject,
                attributes: ["id"],
                include: [
                  {
                    model: Subject,
                    attributes: ["id", "name", "type"],
                  },
                  {
                    model: Teacher,
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
        ],
      });

      // 3️⃣ Organize response
      const result = {};

      timetables.forEach((timetable) => {
        const day = timetable.day_of_week;

        // Map assigned slots
        const assignedMap = {};
        timetable.ClassTimetableSlots.forEach((slot) => {
          assignedMap[slot.time_slot_id] = slot;
        });

        // Fill ALL time slots
        result[day] = allTimeSlots.map((ts) => {
          const assigned = assignedMap[ts.id];

          return {
            time_slot_id: ts.id,
            time: `${ts.start_time} - ${ts.end_time}`,
            subject: assigned?.ClassSubject?.Subject
              ? {
                  id: assigned.ClassSubject.Subject.id,
                  name: assigned.ClassSubject.Subject.name,
                  type: assigned.ClassSubject.Subject.type,
                }
              : null,
            teacher: assigned?.ClassSubject?.Teacher
              ? {
                  id: assigned.ClassSubject.Teacher.id,
                  name: assigned.ClassSubject.Teacher.name,
                }
              : null,
          };
        });
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("❌ Timetable Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
};
