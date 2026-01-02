// packages/db/models/ClassTimetableSlot.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const ClassTimetableSlot = sequelize.define(
  "ClassTimetableSlot",
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

    class_timetable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    time_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    class_subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Label as ENUM
    label: {
      type: DataTypes.ENUM("permanent", "temporary"),
      allowNull: false,
      defaultValue: "permanent", // default is permanent
    },
  },
  {
    tableName: "class_timetable_slots",

    indexes: [
      {
        unique: true,
        fields: ["school_id", "class_timetable_id", "time_slot_id"],
      },
      {
        fields: ["school_id"],
      },
      {
        fields: ["class_timetable_id"],
      },
    ],
  }
);

module.exports = ClassTimetableSlot;
