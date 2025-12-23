// packages/db/models/index.js
const { sequelize } = require("../index");
const Classroom = require("./Classroom");
const PaymentOrder = require("./PaymentOrder");
const PaymentOrderLineItem = require("./PaymentOrderLineItem");
const PaymentService = require("./PaymentService");
const PaymentServiceClass = require("./PaymentServiceClass");
const PaymentSettlementQueue = require("./PaymentSettlementQueue");
const PaymentTransaction = require("./PaymentTransaction");

const School = require("./School");
const SchoolPaymentGateway = require("./SchoolPaymentGateway");
const Student = require("./Student");
const UserAgent = require("./UserAgent");

// Associations
School.hasMany(UserAgent, {
  foreignKey: "school_id",
  onDelete: "CASCADE",
});

UserAgent.belongsTo(School, {
  foreignKey: "school_id",
});

// School → Classroom
School.hasMany(Classroom, {
  foreignKey: "school_id",
  onDelete: "CASCADE",
});

Classroom.belongsTo(School, {
  foreignKey: "school_id",
});

// Classroom → Student
Classroom.hasMany(Student, {
  foreignKey: "classroom_id",
  onDelete: "CASCADE",
});

Student.belongsTo(Classroom, {
  foreignKey: "classroom_id",
});

School.hasMany(Student, {
  foreignKey: "school_id",
});

Student.belongsTo(School, {
  foreignKey: "school_id",
});

PaymentOrder.hasMany(PaymentOrderLineItem, {
  foreignKey: "order_id",
  onDelete: "CASCADE",
});
PaymentOrderLineItem.belongsTo(PaymentOrder, { foreignKey: "order_id" });

PaymentService.hasMany(PaymentOrderLineItem, { foreignKey: "service_id" });
PaymentOrderLineItem.belongsTo(PaymentService, { foreignKey: "service_id" });

PaymentOrder.hasMany(PaymentTransaction, { foreignKey: "order_id" });
PaymentTransaction.belongsTo(PaymentOrder, { foreignKey: "order_id" });

PaymentService.belongsToMany(Classroom, {
  through: PaymentServiceClass,
  foreignKey: "service_id",
  otherKey: "class_id",
  as: "classes",
});

Classroom.belongsToMany(PaymentService, {
  through: PaymentServiceClass,
  foreignKey: "class_id",
  otherKey: "service_id",
  as: "services",
});

module.exports = {
  sequelize,
  School,
  UserAgent,
  Classroom,
  Student,
  PaymentOrder,
  PaymentOrderLineItem,
  PaymentService,
  PaymentTransaction,
  PaymentServiceClass,
  SchoolPaymentGateway,
  PaymentSettlementQueue,
};
