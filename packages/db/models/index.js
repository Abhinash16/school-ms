// packages/db/models/index.js
const { sequelize } = require("../index");
const Classroom = require("./Classroom");

const School = require("./School");
const Student = require("./Student");
const UserAgent = require("./UserAgent");

// Associations
School.hasMany(UserAgent, {
  foreignKey: "school_id",
  onDelete: "CASCADE",
});

UserAgent.belongsTo(School, {
  foreignKey: "school_id",
});

// School → Classroom
School.hasMany(Classroom, {
  foreignKey: "school_id",
  onDelete: "CASCADE",
});

Classroom.belongsTo(School, {
  foreignKey: "school_id",
});

// Classroom → Student
Classroom.hasMany(Student, {
  foreignKey: "classroom_id",
  onDelete: "CASCADE",
});

Student.belongsTo(Classroom, {
  foreignKey: "classroom_id",
});

School.hasMany(Student, {
  foreignKey: "school_id",
});

Student.belongsTo(School, {
  foreignKey: "school_id",
});

module.exports = {
  sequelize,
  School,
  UserAgent,
  Classroom,
  Student,
};
