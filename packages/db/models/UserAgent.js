// packages/db/models/UserAgent.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const UserAgent = sequelize.define(
  "UserAgent",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("SCHOOL_ADMIN", "ACCOUNTANT", "TEACHER", "STAFF"),
      defaultValue: "SCHOOL_ADMIN",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "user_agents",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["school_id"] },
      { fields: ["role"] },
    ],
  }
);

module.exports = UserAgent;
