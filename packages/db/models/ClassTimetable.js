// packages/db/models/ClassTimetable.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const ClassTimetable = sequelize.define(
  "ClassTimetable",
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

    day_of_week: {
      type: DataTypes.ENUM("MON", "TUE", "WED", "THU", "FRI", "SAT"),
      allowNull: false,
    },
  },
  {
    tableName: "class_timetables",

    indexes: [
      {
        unique: true,
        fields: ["school_id", "classroom_id", "day_of_week"],
      },
      {
        fields: ["school_id"],
      },
      {
        fields: ["classroom_id"],
      },
    ],
  }
);

module.exports = ClassTimetable;
