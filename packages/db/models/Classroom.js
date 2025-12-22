// packages/db/models/Classroom.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const Classroom = sequelize.define(
  "Classroom",
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
    section: {
      type: DataTypes.STRING,
    },
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "classrooms",
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["academic_year"] },
      {
        unique: true,
        fields: ["school_id", "name", "section", "academic_year"],
      },
    ],
  }
);

module.exports = Classroom;
