// packages/db/models/Student.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const Student = sequelize.define(
  "Student",
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
    classroom_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    admission_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: DataTypes.STRING,
    gender: {
      type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
    },
    dob: DataTypes.DATEONLY,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "students",
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["classroom_id"] },
      {
        unique: true,
        fields: ["school_id", "admission_no"],
      },
    ],
  }
);

module.exports = Student;
