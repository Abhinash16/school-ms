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

      // ❌ Edge Case: Missing classroom_id
      if (!classroom_id) {
        return res.status(400).json({
          success: false,
          message: "classroom_id is required",
        });
      }

      // Fetch timetables for this classroom
      const timetables = await ClassTimetable.findAll({
        where: { classroom_id },
        include: [
          {
            model: ClassTimetableSlot,
            include: [
              { model: TimeSlot },
              { model: ClassSubject, include: [Subject, Teacher] },
            ],
          },
        ],
      });

      // ❌ Edge Case: No timetables found
      if (!timetables.length) {
        const emptyResult = DAYS.reduce((acc, day) => {
          acc[day] = [];
          return acc;
        }, {});
        console.log("🚀 ~  No timetables found:", emptyResult);
        return res.json({ success: true, data: emptyResult });
      }

      // Organize timetable by day
      const result = DAYS.reduce((acc, day) => {
        acc[day] = [];
        return acc;
      }, {});

      timetables.forEach((timetable) => {
        const day = timetable.day_of_week;

        if (!timetable.ClassTimetableSlots?.length) return;

        result[day] = timetable.ClassTimetableSlots.filter(
          (slot) =>
            slot.TimeSlot && slot.ClassSubject && slot.ClassSubject.Subject
        )
          .sort((a, b) =>
            a.TimeSlot.start_time.localeCompare(b.TimeSlot.start_time)
          )
          .map((slot) => ({
            time_slot: {
              start: slot.TimeSlot.start_time,
              end: slot.TimeSlot.end_time,
            },
            subject: {
              id: slot.ClassSubject.Subject.id,
              name: slot.ClassSubject.Subject.name,
              type: slot.ClassSubject.Subject.type,
            },
            teacher: slot.ClassSubject.Teacher
              ? {
                  id: slot.ClassSubject.Teacher.id,
                  name: slot.ClassSubject.Teacher.name,
                }
              : null,
          }));
      });

      return res.json({ success: true, data: result });
    } catch (err) {
      console.error("❌ Error fetching timetable:", err);
      return res.status(500).json({
        success: false,
        message: "Something went wrong while fetching timetable",
        error: err.message,
      });
    }
  },
};
