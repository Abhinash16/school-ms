// controllers/exam.controller.js
const {
  Exam,
  Classroom,
  ExamClass,
  ExamSubject,
  Student,
  Subject,
  StudentExamMark,
} = require("../../../../../packages/db/models");

module.exports = {
  async createExam(req, res) {
    try {
      const { name, exam_type, start_date, end_date } = req.body;

      const exam = await Exam.create({
        name,
        exam_type,
        start_date,
        end_date,
        school_id: req.school.id,
      });

      res.status(201).json({ success: true, data: exam });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getAllExams(req, res) {
    try {
      const exams = await Exam.findAll({
        where: { school_id: req.school.id },
        include: [
          {
            model: Classroom,
            through: { model: ExamClass },
            as: "Classrooms", // optional alias
            attributes: ["id", "name", "section", "academic_year"],
          },
          {
            model: ExamSubject,
            attributes: [
              "id",
              "subject_id",
              "classroom_id",
              "total_marks",
              "passing_marks",
            ],
          },
        ],
        order: [["start_date", "ASC"]],
      });

      res.json({ success: true, data: exams });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /exams/:id
  async getExamById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Exam id is required",
        });
      }

      const exam = await Exam.findOne({
        where: {
          id,
          school_id: req.school.id, // important for school-level security
        },
        include: [
          {
            model: Classroom,
            through: { model: ExamClass },
            as: "Classrooms",
            attributes: ["id", "name", "section", "academic_year"],
          },
          {
            model: ExamSubject,
            attributes: [
              "id",
              "subject_id",
              "classroom_id",
              "total_marks",
              "passing_marks",
            ],
            include: [
              {
                model: Subject,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      res.json({
        success: true,
        data: exam,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // GET /api/exam/class/:id
  async getExamsByClass(req, res) {
    try {
      const classroomId = req.params.id; // <-- match route param

      if (!classroomId) {
        return res.status(400).json({
          success: false,
          message: "Classroom ID is required",
        });
      }

      const exams = await Exam.findAll({
        where: { school_id: req.school.id },
        include: [
          {
            model: Classroom,
            through: { model: ExamClass },
            as: "Classrooms",
            where: { id: classroomId }, // filter by classroom
            attributes: ["id", "name", "section", "academic_year"],
          },
          {
            model: ExamSubject,
            attributes: [
              "id",
              "subject_id",
              "classroom_id",
              "total_marks",
              "passing_marks",
            ],
            include: [
              {
                model: Subject,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        order: [["start_date", "ASC"]],
      });

      res.json({
        success: true,
        data: exams,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  async assignClasses(req, res) {
    try {
      const { examId } = req.params;
      const { classroom_ids } = req.body;

      const exam = await Exam.findOne({
        where: { id: examId, school_id: req.school.id },
      });

      if (!exam)
        return res
          .status(404)
          .json({ success: false, message: "Exam not found" });

      const classrooms = await Classroom.findAll({
        where: { id: classroom_ids, school_id: req.school.id },
      });

      if (classrooms.length !== classroom_ids.length)
        return res.status(400).json({
          success: false,
          message: "Invalid classroom(s)",
        });

      const payload = classroom_ids.map((id) => ({
        exam_id: examId,
        classroom_id: id,
      }));

      await ExamClass.bulkCreate(payload, { ignoreDuplicates: true });

      res.json({ success: true, message: "Exam assigned to classes" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async addSubject(req, res) {
    try {
      const { examId } = req.params;
      const { classroom_id, subject_id, total_marks, passing_marks } = req.body;

      const assigned = await ExamClass.findOne({
        where: { exam_id: examId, classroom_id },
      });

      if (!assigned)
        return res.status(400).json({
          success: false,
          message: "Exam not assigned to this class",
        });

      const subject = await ExamSubject.create({
        exam_id: examId,
        classroom_id,
        subject_id,
        total_marks,
        passing_marks,
      });

      res.status(201).json({ success: true, data: subject });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async submitMarks(req, res) {
    try {
      const { exam_id, classroom_id, student_id, marks } = req.body;

      // ------------------ Validation ------------------
      if (!exam_id || !classroom_id || !student_id || !Array.isArray(marks)) {
        return res.status(400).json({
          success: false,
          message: "exam_id, classroom_id, student_id and marks[] are required",
        });
      }

      // ------------------ Validate Student ------------------
      const student = await Student.findOne({
        where: {
          id: student_id,
          classroom_id,
          school_id: req.school.id,
        },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found in this class",
        });
      }

      // ------------------ Fetch ExamSubjects ------------------
      const subjectIds = marks.map((m) => m.subject_id);

      const examSubjects = await ExamSubject.findAll({
        where: {
          subject_id: subjectIds,
          exam_id,
          classroom_id,
        },
      });

      if (!examSubjects.length) {
        return res.status(400).json({
          success: false,
          message: "No valid exam subjects for this classroom",
        });
      }

      // ------------------ Prepare Payload ------------------
      const payload = examSubjects.map((es) => {
        const mark = marks.find((m) => m.subject_id === es.subject_id);

        return {
          exam_id,
          classroom_id,
          subject_id: es.subject_id,
          student_id,
          marks_obtained: mark?.obtained_marks ?? 0,
          is_absent: mark?.is_absent || false,
        };
      });

      // ------------------ Save / Update ------------------
      await StudentExamMark.bulkCreate(payload, {
        updateOnDuplicate: ["marks_obtained", "is_absent"],
      });

      // ------------------ Calculate total, pass/fail ------------------
      const savedMarks = await StudentExamMark.findAll({
        where: {
          exam_id,
          classroom_id,
          student_id,
        },
      });

      let totalMarks = 0;
      let totalSubjects = savedMarks.length;
      let failedSubjects = 0;

      const resultDetails = savedMarks.map((m) => {
        totalMarks += m.marks_obtained;
        const passed = m.marks_obtained >= 35; // assuming 35 is pass mark
        if (!passed) failedSubjects++;
        return {
          subject_id: m.subject_id,
          marks_obtained: m.marks_obtained,
          pass: passed,
        };
      });

      const overallPass = failedSubjects === 0;

      return res.json({
        success: true,
        message: "Marks saved successfully",
        data: {
          totalMarks,
          totalSubjects,
          failedSubjects,
          overallPass,
          resultDetails,
        },
      });
    } catch (err) {
      console.error("❌ submitMarks error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  async getResult(req, res) {
    try {
      let { examId, student_id, classroom_id } = req.query;

      console.log("🚀 ~> req.query:", req.query);

      if (!examId || !student_id || !classroom_id) {
        return res.status(400).json({
          success: false,
          message: "examId, student_id, and classroom_id are required",
        });
      }

      // Convert query params to integers
      examId = parseInt(examId, 10);
      student_id = parseInt(student_id, 10);
      classroom_id = parseInt(classroom_id, 10);

      const marks = await StudentExamMark.findAll({
        where: { exam_id: examId, student_id, classroom_id },
        include: [
          {
            model: ExamSubject,
            as: "ExamSubject",
            required: false, // allow marks even if ExamSubject is missing
            where: { exam_id: examId, classroom_id },
            attributes: ["total_marks", "passing_marks", "subject_id"],
            include: [
              {
                model: Subject,
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      if (!marks.length) {
        return res.status(404).json({
          success: false,
          message: "No marks found for this student in this exam",
        });
      }

      let total = 0,
        obtained = 0,
        fail = false;

      const subjects = marks.map((m) => {
        const subjectName = m.ExamSubject?.Subject?.name || "Unknown"; // ✅ get subject name
        const totalMarks = m.ExamSubject?.total_marks || 0;
        const passingMarks = m.ExamSubject?.passing_marks || 0;

        total += totalMarks;
        obtained += m.marks_obtained || 0;
        if (m.marks_obtained < passingMarks) fail = true;

        return {
          subject: subjectName,
          marks_obtained: m.marks_obtained,
          total_marks: totalMarks,
          passing_marks: passingMarks,
          status: m.marks_obtained < passingMarks ? "FAIL" : "PASS",
        };
      });

      res.json({
        success: true,
        data: {
          total,
          obtained,
          percentage: total ? ((obtained / total) * 100).toFixed(2) : "0.00",
          status: fail ? "FAIL" : "PASS",
          subjects,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
