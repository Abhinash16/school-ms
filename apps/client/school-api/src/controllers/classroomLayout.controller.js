const Classroom = require("../../../../../packages/db/models/Classroom");
const ClassroomLayout = require("../../../../../packages/db/models/ClassroomLayout");
const LayoutRow = require("../../../../../packages/db/models/LayoutRow");
const LayoutBench = require("../../../../../packages/db/models/LayoutBench");
const handleSQLError = require("../utils/sqlErrorHandler");
const LayoutBenchStudent = require("../../../../../packages/db/models/LayoutBenchStudent");
const { Student } = require("../../../../../packages/db/models");
const { Op } = require("sequelize");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
module.exports = {
  /* ===============================
     LAYOUT
  =============================== */

  async createLayout(req, res) {
    try {
      const { classroom_id } = req.params;
      const { name, description } = req.body;
      const school_id = req.school.id;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Layout name is required",
        });
      }

      const classroom = await Classroom.findOne({
        where: { id: classroom_id, school_id },
      });

      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found",
        });
      }

      const layout = await ClassroomLayout.create({
        school_id,
        classroom_id,
        name: name.trim(),
        description,
      });

      return res.json({ success: true, data: layout });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getLayouts(req, res) {
    try {
      const { classroom_id } = req.params;
      const school_id = req.school.id;

      const layouts = await ClassroomLayout.findAll({
        where: { classroom_id, school_id },
        order: [["createdAt", "DESC"]],
      });

      return res.json({ success: true, data: layouts });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async deleteLayout(req, res) {
    try {
      const { layout_id } = req.params;
      const school_id = req.school.id;

      await ClassroomLayout.destroy({
        where: { id: layout_id, school_id },
      });

      return res.json({
        success: true,
        message: "Layout deleted",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /* ===============================
     ROWS
  =============================== */

  async addRow(req, res) {
    try {
      const { layout_id } = req.params;
      const { row_no } = req.body;
      const school_id = req.school.id;

      if (!row_no) {
        return res.status(400).json({
          success: false,
          message: "row_no is required",
        });
      }

      const layout = await ClassroomLayout.findOne({
        where: { id: layout_id, school_id },
      });

      if (!layout) {
        return res.status(404).json({
          success: false,
          message: "Layout not found",
        });
      }

      const row = await LayoutRow.create({
        school_id,
        classroom_layout_id: layout_id,
        row_no,
      });

      return res.json({ success: true, data: row });
    } catch (err) {
      const errorResponse = handleSQLError(err);
      return res.status(500).json(errorResponse);
    }
  },

  async getRows(req, res) {
    try {
      const { layout_id } = req.params;
      const school_id = req.school.id;

      const rows = await LayoutRow.findAll({
        where: { classroom_layout_id: layout_id, school_id },
        order: [["row_no", "ASC"]],
      });

      return res.json({ success: true, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async deleteRow(req, res) {
    try {
      const { row_id } = req.params;
      const school_id = req.school.id;

      await LayoutRow.destroy({
        where: { id: row_id, school_id },
      });

      return res.json({ success: true, message: "Row deleted" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /* ===============================
     BENCHES
  =============================== */

  async addBench(req, res) {
    try {
      const { row_id } = req.params;
      const { bench_no, seat_capacity = 2 } = req.body;
      const school_id = req.school.id;

      if (!bench_no) {
        return res.status(400).json({
          success: false,
          message: "bench_no is required",
        });
      }

      const row = await LayoutRow.findOne({
        where: { id: row_id, school_id },
      });

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Row not found",
        });
      }

      const bench = await LayoutBench.create({
        school_id,
        layout_row_id: row_id,
        bench_no,
        seat_capacity,
      });

      return res.json({ success: true, data: bench });
    } catch (err) {
      const errorResponse = handleSQLError(err);
      return res.status(500).json(errorResponse);
    }
  },

  async getBenches(req, res) {
    try {
      const { row_id } = req.params;
      const school_id = req.school.id;

      const benches = await LayoutBench.findAll({
        where: { layout_row_id: row_id, school_id },
        order: [["bench_no", "ASC"]],
      });

      return res.json({ success: true, data: benches });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async deleteBench(req, res) {
    try {
      const { bench_id } = req.params;
      const school_id = req.school.id;

      await LayoutBench.destroy({
        where: { id: bench_id, school_id },
      });

      return res.json({ success: true, message: "Bench deleted" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async assignStudents(req, res) {
    try {
      const { bench_id } = req.params;
      const { students } = req.body;
      // students: [{ student_id, seat_no, assigned_mode }]

      const { id: school_id } = req.school;

      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          message: "students array is required",
        });
      }

      // Fetch bench
      const bench = await LayoutBench.findByPk(bench_id, {
        include: ["LayoutRow"],
      });

      if (!bench) {
        return res
          .status(404)
          .json({ success: false, message: "Bench not found" });
      }

      const classroom_layout_id = bench.LayoutRow.classroom_layout_id;

      // Capacity check
      const occupied = await LayoutBenchStudent.count({
        where: { layout_bench_id: bench_id },
      });

      if (occupied + students.length > bench.capacity) {
        return res.status(400).json({
          success: false,
          message: "Bench capacity exceeded",
        });
      }

      // Filter out duplicates (same student in same layout)
      const studentIds = students.map((s) => s.student_id);

      const existing = await LayoutBenchStudent.findAll({
        where: {
          classroom_layout_id,
          student_id: studentIds,
        },
      });

      const existingIds = existing.map((e) => e.student_id);

      const newAssignments = students
        .filter((s) => !existingIds.includes(s.student_id))
        .map((s) => ({
          layout_bench_id: bench_id,
          classroom_layout_id,
          student_id: s.student_id,
          school_id,
          seat_no: s.seat_no,
          assigned_mode: s.assigned_mode || "MANUAL",
        }));

      // Bulk create
      await LayoutBenchStudent.bulkCreate(newAssignments);

      return res.json({
        success: true,
        added: newAssignments.length,
        skipped: existingIds,
      });
    } catch (err) {
      const errorResponse = handleSQLError(err);
      return res.status(500).json(errorResponse);
    }
  },

  // Remove student from a bench
  async removeStudent(req, res) {
    try {
      const { id } = req.params; // LayoutBenchStudent ID
      await LayoutBenchStudent.destroy({ where: { id } });
      return res.json({ success: true, message: "Student removed from bench" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get all students of a bench
  async getBenchStudents(req, res) {
    try {
      const { bench_id } = req.params;
      const students = await LayoutBenchStudent.findAll({
        where: { layout_bench_id: bench_id },
        include: ["Student"], // join Student model
        order: [["seat_no", "ASC"]],
      });
      return res.json({ success: true, data: students });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async autoAssignStudents(req, res) {
    try {
      const { classroom_layout_id, assigned_mode } = req.body;
      const { id: school_id } = req.school;

      if (!classroom_layout_id || !["ROLL", "RANDOM"].includes(assigned_mode)) {
        return res.status(400).json({
          success: false,
          message:
            "classroom_layout_id and assigned_mode (ROLL or RANDOM) are required",
        });
      }

      // 1️⃣ Fetch all benches for this layout
      const benches = await LayoutBench.findAll({
        include: [
          {
            model: LayoutRow,
            where: { classroom_layout_id },
          },
          {
            model: LayoutBenchStudent,
            as: "LayoutBenchStudents",
          },
        ],
        order: [["id", "ASC"]],
      });

      if (!benches.length) {
        return res.status(404).json({
          success: false,
          message: "No benches found for this layout",
        });
      }

      // 2️⃣ Determine classroom_id from layout
      const layout = await ClassroomLayout.findByPk(classroom_layout_id);
      if (!layout) {
        return res.status(404).json({
          success: false,
          message: "Classroom layout not found",
        });
      }
      const classroom_id = layout.classroom_id;

      // 3️⃣ Fetch students of this classroom not yet assigned
      const assignedStudentIds = benches.flatMap((b) =>
        b.LayoutBenchStudents.map((s) => s.student_id)
      );

      const students = await Student.findAll({
        where: {
          classroom_id,
          id: { [Op.notIn]: assignedStudentIds },
        },
        order: assigned_mode === "ROLL" ? [["roll_no", "ASC"]] : undefined,
      });

      if (!students.length) {
        return res.json({
          success: true,
          message: "All students already assigned",
        });
      }

      if (assigned_mode === "ROLL") {
        // Ensure all students have roll_no
        const noRoll = students.filter((s) => s.roll_no === null);
        if (noRoll.length) {
          return res.status(400).json({
            success: false,
            message: `Cannot assign by ROLL: ${noRoll.length} student(s) have no roll_no`,
            data: noRoll.map((s) => ({ id: s.id, name: s.first_name })),
          });
        }
      }

      // 4️⃣ Shuffle if RANDOM
      if (assigned_mode === "RANDOM") shuffleArray(students);

      // 5️⃣ Assign students to benches
      const assignments = [];
      let studentIndex = 0;

      for (const bench of benches) {
        const occupiedSeats = bench.LayoutBenchStudents.map((s) => s.seat_no);
        for (let seat = 1; seat <= bench.seat_capacity; seat++) {
          if (!occupiedSeats.includes(seat) && studentIndex < students.length) {
            const student = students[studentIndex++];
            assignments.push({
              layout_bench_id: bench.id,
              classroom_layout_id,
              school_id,
              student_id: student.id,
              seat_no: seat,
              assigned_mode,
            });
          }
        }
      }

      // 6️⃣ Bulk insert
      await LayoutBenchStudent.bulkCreate(assignments);

      return res.json({
        success: true,
        message: `${assignments.length} students assigned`,
        data: assignments,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
