const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const NoticeTarget = sequelize.define(
  "NoticeTarget",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    notice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    target_type: {
      type: DataTypes.ENUM("SCHOOL", "CLASS", "STUDENT"),
      allowNull: false,
    },

    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL only for SCHOOL
    },
  },
  {
    tableName: "notice_targets",
    timestamps: true,
    indexes: [
      { fields: ["notice_id"] },
      { fields: ["target_type", "target_id"] },
    ],
  }
);

module.exports = NoticeTarget;
