// packages/db/models/PaymentService.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const PaymentService = sequelize.define(
  "PaymentService",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    default_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "payment_services",
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { unique: true, fields: ["school_id", "title"] },
      { fields: ["status"] },
    ],
  }
);

module.exports = PaymentService;
