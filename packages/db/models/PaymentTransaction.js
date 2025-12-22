// packages/db/models/PaymentTransaction.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const PaymentTransaction = sequelize.define(
  "PaymentTransaction",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    method: {
      // How payment was made
      type: DataTypes.ENUM("CASH", "ONLINE", "QR", "PG"),
      allowNull: false,
    },

    gateway: {
      // Who processed it
      type: DataTypes.ENUM("NONE", "RAZORPAY", "CASHFREE"),
      defaultValue: "NONE",
    },

    gateway_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    gateway_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("SUCCESS", "FAILED", "PENDING"),
      defaultValue: "SUCCESS",
    },

    created_by: {
      // school admin / agent
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "payment_transactions",
    timestamps: true,
    indexes: [
      { fields: ["order_id"] },
      { fields: ["school_id"] },
      { fields: ["gateway_payment_id"] },
      { fields: ["createdAt"] },
    ],
  }
);

module.exports = PaymentTransaction;
