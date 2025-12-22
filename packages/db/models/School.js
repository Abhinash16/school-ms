// packages/db/models/School.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const School = sequelize.define(
  "School",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACTIVE", "INACTIVE"),
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "schools",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["code"] },
      { unique: true, fields: ["email"] },
    ],
  }
);

module.exports = School;
