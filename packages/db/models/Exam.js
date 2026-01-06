// packages/db/models/Exam.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const Exam = sequelize.define(
  "Exam",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exam_type: {
      type: DataTypes.ENUM("THEORY", "PRACTICAL", "ONLINE"),
      defaultValue: "THEORY",
    },
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    status: {
      type: DataTypes.ENUM("DRAFT", "ONGOING", "COMPLETED", "PUBLISHED"),
      defaultValue: "DRAFT",
    },
  },
  {
    tableName: "exams",
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { unique: true, fields: ["school_id", "name"] },
    ],
  }
);

module.exports = Exam;
