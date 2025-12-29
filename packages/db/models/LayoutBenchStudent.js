// packages/db/models/LayoutBenchStudent.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const LayoutBenchStudent = sequelize.define(
  "LayoutBenchStudent",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    classroom_layout_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    layout_bench_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    seat_no: {
      type: DataTypes.INTEGER,
      allowNull: false, // 1,2,3...
    },

    assigned_mode: {
      type: DataTypes.ENUM("ROLL", "RANDOM", "MANUAL"),
      allowNull: false,
    },
  },
  {
    tableName: "layout_bench_students",

    uniqueKeys: {
      // 🔒 One student can sit only once in a layout
      unique_student_per_layout: {
        fields: ["classroom_layout_id", "student_id"],
      },

      // 🔒 One seat per bench
      unique_seat_per_bench: {
        fields: ["layout_bench_id", "seat_no"],
      },
    },
  }
);

module.exports = LayoutBenchStudent;
