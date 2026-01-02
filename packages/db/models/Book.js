// packages/db/models/Book.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const Book = sequelize.define(
  "Book",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    classroom_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING },
    isbn: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM("AVAILABLE", "ISSUED", "LOST"),
      defaultValue: "AVAILABLE",
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    availableQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    issuedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { tableName: "books", timestamps: true }
);

module.exports = Book;
