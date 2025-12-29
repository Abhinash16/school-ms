const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const TimeSlot = sequelize.define(
  "TimeSlot",
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
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    tableName: "time_slots",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["school_id", "start_time", "end_time"],
      },
    ],
  }
);

module.exports = TimeSlot;
