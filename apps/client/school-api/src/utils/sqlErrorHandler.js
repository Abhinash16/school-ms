// utils/sqlErrorHandler.js

function handleSQLError(err) {
  const response = {
    success: false,
    message: "",
    code: err.code || err.parent?.code || "UNKNOWN",
  };

  // Sequelize Unique Constraint
  if (err.name === "SequelizeUniqueConstraintError") {
    response.message =
      err.parent?.sqlMessage ||
      err.errors?.[0]?.message ||
      "Duplicate entry error";
    response.fields = err.fields || {};
  }
  // Sequelize Foreign Key Constraint
  else if (err.name === "SequelizeForeignKeyConstraintError") {
    response.message = err.parent?.sqlMessage || "Foreign key constraint error";
    response.fields = err.fields || {};
  }
  // Other SQL errors
  else if (err.parent?.sqlMessage) {
    response.message = err.parent.sqlMessage;
  }
  // Fallback
  else {
    response.message = err.message || "Database error occurred";
  }

  return response;
}

module.exports = handleSQLError;
