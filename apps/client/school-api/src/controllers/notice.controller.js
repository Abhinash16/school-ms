const { Op } = require("sequelize");
const Classroom = require("../../../../../packages/db/models/Classroom");
const Student = require("../../../../../packages/db/models/Student");
const Notice = require("../../../../../packages/db/models/Notice");
const NoticeTarget = require("../../../../../packages/db/models/NoticeTarget");

/* ===============================
   NOTICES
=============================== */

module.exports = {
  /* ===============================
     CREATE + ASSIGN NOTICE
  =============================== */
  async createNotice(req, res) {
    try {
      const { title, message, notice_type, expire_at, targets } = req.body;
      const school_id = req.school.id;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: "Title and message are required",
        });
      }

      if (
        !targets ||
        (!targets.school &&
          !targets.classes?.length &&
          !targets.students?.length)
      ) {
        return res.status(400).json({
          success: false,
          message: "At least one target (school / class / student) is required",
        });
      }

      // 1️⃣ Create notice
      const notice = await Notice.create({
        school_id,
        title: title.trim(),
        message,
        notice_type: notice_type || "GENERAL",
        expire_at: expire_at || null,
        created_by: req.school.user_id || null,
      });

      const assignments = [];

      // 2️⃣ School-wide
      if (targets.school === true) {
        assignments.push({
          notice_id: notice.id,
          target_type: "SCHOOL",
          target_id: null,
        });
      }

      // 3️⃣ Class-wise
      if (Array.isArray(targets.classes)) {
        const classrooms = await Classroom.findAll({
          where: {
            id: targets.classes,
            school_id,
          },
        });

        classrooms.forEach((cls) => {
          assignments.push({
            notice_id: notice.id,
            target_type: "CLASS",
            target_id: cls.id,
          });
        });
      }

      // 4️⃣ Student-wise
      if (Array.isArray(targets.students)) {
        const students = await Student.findAll({
          where: {
            id: targets.students,
            school_id,
          },
        });

        students.forEach((student) => {
          assignments.push({
            notice_id: notice.id,
            target_type: "STUDENT",
            target_id: student.id,
          });
        });
      }

      await NoticeTarget.bulkCreate(assignments);

      return res.json({
        success: true,
        message: "Notice created and assigned successfully",
        data: notice,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  /* ===============================
     GET NOTICES FOR CLASS
  =============================== */
  async getClassNotices(req, res) {
    try {
      const { classroom_id } = req.params;
      const school_id = req.school.id;

      const notices = await Notice.findAll({
        where: {
          school_id,
          expire_at: {
            [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null }],
          },
        },
        include: [
          {
            model: NoticeTarget,
            where: {
              [Op.or]: [
                { target_type: "SCHOOL" },
                {
                  target_type: "CLASS",
                  target_id: classroom_id,
                },
              ],
            },
          },
        ],
        order: [["createdAt", "DESC"]],
        distinct: true,
      });

      return res.json({ success: true, data: notices });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  /* ===============================
     GET NOTICES FOR STUDENT
  =============================== */
  async getStudentNotices(req, res) {
    try {
      const { student_id } = req.params;
      const school_id = req.school.id;

      const student = await Student.findOne({
        where: { id: student_id, school_id },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const notices = await Notice.findAll({
        where: {
          school_id,
          expire_at: {
            [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null }],
          },
        },
        include: [
          {
            model: NoticeTarget,
            where: {
              [Op.or]: [
                { target_type: "SCHOOL" },
                {
                  target_type: "CLASS",
                  target_id: student.classroom_id,
                },
                {
                  target_type: "STUDENT",
                  target_id: student.id,
                },
              ],
            },
          },
        ],
        order: [["createdAt", "DESC"]],
        distinct: true,
      });

      return res.json({ success: true, data: notices });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  /* ===============================
     UPDATE NOTICE
  =============================== */
  async updateNotice(req, res) {
    try {
      const { notice_id } = req.params;
      const { title, message, notice_type, expire_at } = req.body;
      const school_id = req.school.id;

      const notice = await Notice.findOne({
        where: { id: notice_id, school_id },
      });

      if (!notice) {
        return res.status(404).json({
          success: false,
          message: "Notice not found",
        });
      }

      await notice.update({
        title: title?.trim() ?? notice.title,
        message: message ?? notice.message,
        notice_type: notice_type ?? notice.notice_type,
        expire_at: expire_at ?? notice.expire_at,
      });

      return res.json({
        success: true,
        message: "Notice updated successfully",
        data: notice,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  /* ===============================
     DELETE NOTICE
  =============================== */
  async deleteNotice(req, res) {
    try {
      const { notice_id } = req.params;
      const school_id = req.school.id;

      const deleted = await Notice.destroy({
        where: { id: notice_id, school_id },
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Notice not found",
        });
      }

      return res.json({
        success: true,
        message: "Notice deleted",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
};
