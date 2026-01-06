// packages/db/models/StudentExamMark.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const StudentExamMark = sequelize.define(
  "StudentExamMark",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classroom_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    marks_obtained: {
      type: DataTypes.FLOAT,
    },
    is_absent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "student_exam_marks",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["exam_id", "classroom_id", "subject_id", "student_id"],
      },
    ],
  }
);

module.exports = StudentExamMark;
