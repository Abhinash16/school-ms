// packages/db/models/ClassSubject.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const ClassSubject = sequelize.define(
  "ClassSubject",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    classroom_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: DataTypes.INTEGER, allowNull: true }, // null for breaks
  },
  {
    tableName: "class_subjects",
    indexes: [
      { fields: ["school_id"] },
      { fields: ["classroom_id"] },
      { fields: ["subject_id"] },
      { fields: ["teacher_id"] },
    ],
    uniqueKeys: {
      unique_class_subject: {
        fields: ["school_id", "classroom_id", "subject_id"],
      },
    },
  }
);

module.exports = ClassSubject;
