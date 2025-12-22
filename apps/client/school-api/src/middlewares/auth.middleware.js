const jwtUtil = require("../utils/jwt");

/**
 * Middleware: authenticateSchool
 * Checks JWT token, verifies it, and attaches school info to req.school
 */
function authenticateSchool(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ success: false, message: "Token missing" });

    const token = authHeader.split(" ")[1]; // Expect: Bearer <token>
    const decoded = jwtUtil.verify(token);

    // You can also check role here if needed
    if (!decoded.school_id)
      return res
        .status(403)
        .json({ success: false, message: "Invalid token: school_id missing" });

    // Attach school info to request
    req.school = {
      id: decoded.school_id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

module.exports = { authenticateSchool };
