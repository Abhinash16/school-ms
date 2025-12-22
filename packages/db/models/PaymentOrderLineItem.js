const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");
const PaymentOrder = require("./PaymentOrder");

const PaymentOrderLineItem = sequelize.define(
  "PaymentOrderLineItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: true },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    notes: { type: DataTypes.TEXT },
  },
  { tableName: "payment_order_line_items", timestamps: true }
);

module.exports = PaymentOrderLineItem;
