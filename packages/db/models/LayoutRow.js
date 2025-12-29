// packages/db/models/LayoutRow.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const LayoutRow = sequelize.define(
  "LayoutRow",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    classroom_layout_id: { type: DataTypes.INTEGER, allowNull: false },
    row_no: { type: DataTypes.INTEGER, allowNull: false }, // 1,2,3...
  },
  {
    tableName: "layout_rows",
    uniqueKeys: {
      unique_row_per_layout: {
        fields: ["classroom_layout_id", "row_no"],
      },
    },
  }
);

module.exports = LayoutRow;
