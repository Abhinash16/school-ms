// packages/db/models/PaymentServiceClass.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const PaymentServiceClass = sequelize.define(
  "PaymentServiceClass",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  },
  {
    tableName: "payment_service_classes",
    timestamps: true,
    indexes: [
      { fields: ["service_id"] },
      { fields: ["class_id"] },
      { unique: true, fields: ["service_id", "class_id", "school_id"] },
    ],
  }
);

module.exports = PaymentServiceClass;
