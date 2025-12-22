// packages/db/models/PaymentOrder.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const PaymentOrder = sequelize.define(
  "PaymentOrder",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: true },
    total_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("PENDING", "PAID", "NO_PAYMENT_REQUIRED"),
      defaultValue: "PENDING",
    },
    payment_method: {
      type: DataTypes.ENUM("CASH", "ONLINE", "QR", "PG_LINK"),
      allowNull: true,
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "payment_orders", timestamps: true }
);

module.exports = PaymentOrder;
