// packages/db/models/Teacher.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const Teacher = sequelize.define(
  "Teacher",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    phone: { type: DataTypes.STRING, allowNull: true, unique: true },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "teachers",
    indexes: [{ fields: ["school_id"] }],
  }
);

module.exports = Teacher;
