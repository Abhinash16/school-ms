// packages/db/models/ClassroomLayout.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const ClassroomLayout = sequelize.define(
  "ClassroomLayout",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    classroom_id: { type: DataTypes.INTEGER, allowNull: false },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false }, // regular, exam_mid_term
    is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "classroom_layouts",
    uniqueKeys: {
      unique_layout_per_class: {
        fields: ["classroom_id", "name"],
      },
    },
  }
);

module.exports = ClassroomLayout;
