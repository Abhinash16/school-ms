const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const PaymentSettlementQueue = sequelize.define(
  "PaymentSettlementQueue",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    provider: {
      type: DataTypes.ENUM("RAZORPAY", "CASHFREE"),
      allowNull: false,
    },

    event_type: {
      type: DataTypes.STRING,
      allowNull: false, // important
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    reference: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    gateway_payment_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "PROCESSING", "SUCCESS", "FAILED"),
      defaultValue: "PENDING",
    },

    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    last_error: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "payment_settlement_queue",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["provider", "gateway_payment_id", "event_type"],
        name: "uniq_provider_payment_event",
      },
      { fields: ["status"] },
      { fields: ["order_id"] },
      { fields: ["school_id"] },
    ],
  }
);

module.exports = PaymentSettlementQueue;
