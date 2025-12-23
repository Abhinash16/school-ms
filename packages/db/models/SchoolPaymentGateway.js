// packages/db/models/SchoolPaymentGateway.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const SchoolPaymentGateway = sequelize.define(
  "SchoolPaymentGateway",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    provider: {
      type: DataTypes.ENUM("RAZORPAY", "CASHFREE"),
      allowNull: false,
    },

    credentials: {
      // encrypted JSON later
      type: DataTypes.JSON,
      allowNull: false,
    },

    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    validate: {
      validCredentials() {
        if (!this.credentials || typeof this.credentials !== "object") {
          throw new Error("Credentials must be a JSON object");
        }

        const creds = this.credentials;
        switch (this.provider) {
          case "RAZORPAY":
            if (!creds.key_id || !creds.key_secret || creds.webhook_secret) {
              throw new Error(
                "Razorpay credentials must include key_id and key_secret"
              );
            }
            break;
          case "CASHFREE":
            if (!creds.app_id || !creds.secret_key) {
              throw new Error(
                "Cashfree credentials must include app_id and secret_key"
              );
            }
            break;
          default:
            throw new Error("Unsupported payment provider");
        }
      },
    },
    tableName: "school_payment_gateways",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["school_id", "provider"] },
      { fields: ["enabled"] },
    ],
  }
);

module.exports = SchoolPaymentGateway;
