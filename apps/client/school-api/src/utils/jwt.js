const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.SCHOOL_JWT_SECRET || "school-secret";
const JWT_EXPIRES_IN = "1d";

module.exports = {
  sign(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "school-api",
    });
  },

  verify(token) {
    return jwt.verify(token, JWT_SECRET);
  },
};
