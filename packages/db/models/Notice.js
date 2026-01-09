const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const Notice = sequelize.define(
  "Notice",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    notice_type: {
      type: DataTypes.ENUM("GENERAL", "EXAM", "HOMEWORK", "EVENT"),
      defaultValue: "GENERAL",
    },

    expire_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "notices", // 👈 IMPORTANT (rename table)
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["notice_type"] },
      { fields: ["expire_at"] },
    ],
  }
);

module.exports = Notice;
