// packages/db/models/LayoutBench.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const LayoutBench = sequelize.define(
  "LayoutBench",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    layout_row_id: { type: DataTypes.INTEGER, allowNull: false },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    bench_no: { type: DataTypes.INTEGER, allowNull: false }, // position in row
    seat_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "layout_benches",
    uniqueKeys: {
      unique_bench_per_row: {
        fields: ["layout_row_id", "bench_no"],
      },
    },
  }
);

module.exports = LayoutBench;
