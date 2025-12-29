// packages/db/models/Subject.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const Subject = sequelize.define(
  "Subject",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM("ACADEMIC", "BREAK"),
      allowNull: false,
    },
  },
  {
    tableName: "subjects",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["school_id", "name", "type"],
      },
    ],
  }
);

module.exports = Subject;
