// packages/db/models/ExamClass.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const ExamClass = sequelize.define(
  "ExamClass",
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
  },
  {
    tableName: "exam_classes",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["exam_id", "classroom_id"],
      },
    ],
  }
);

module.exports = ExamClass;
