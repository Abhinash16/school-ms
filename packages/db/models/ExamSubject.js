// packages/db/models/ExamSubject.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const ExamSubject = sequelize.define(
  "ExamSubject",
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
    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passing_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "exam_subjects",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["exam_id", "classroom_id", "subject_id"],
      },
    ],
  }
);

module.exports = ExamSubject;
