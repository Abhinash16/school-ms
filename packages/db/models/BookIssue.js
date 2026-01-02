// packages/db/models/BookIssue.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const BookIssue = sequelize.define(
  "BookIssue",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    issue_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    return_date: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.ENUM("ISSUED", "RETURNED"),
      defaultValue: "ISSUED",
    },
  },
  { tableName: "book_issues", timestamps: true }
);

module.exports = BookIssue;
