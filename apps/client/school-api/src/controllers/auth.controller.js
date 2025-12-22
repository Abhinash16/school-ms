const bcrypt = require("bcrypt");

const jwtUtil = require("../utils/jwt");
const { UserAgent, School } = require("../../../../../packages/db/models");

module.exports = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password required",
        });
      }

      // Find user
      const user = await UserAgent.findOne({
        where: { email },
        include: {
          model: School,
          attributes: ["id", "status"],
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      if (user.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          message: "User inactive",
        });
      }

      if (user.School.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          message: "School inactive",
        });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Create school-scoped JWT
      const token = jwtUtil.sign({
        user_id: user.id,
        school_id: user.school_id,
        role: user.role,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          school_id: user.school_id,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  },
};
