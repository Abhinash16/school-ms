// apps/platform/api/src/controllers/school.controller.js

const bcrypt = require("bcrypt");
const {
  School,
  UserAgent,
  sequelize,
} = require("../../../../../packages/db/models");

module.exports = {
  // Onboard School
  async createSchool(req, res) {
    const t = await sequelize.transaction();

    try {
      const { school_name, school_code, email, admin_email, admin_password } =
        req.body;

      // 1. Create school
      const school = await School.create(
        {
          name: school_name,
          code: school_code,
          email,
          status: "ACTIVE",
        },
        { transaction: t }
      );

      // 2. Create admin user
      const hashedPassword = await bcrypt.hash(admin_password, 10);

      await UserAgent.create(
        {
          school_id: school.id,
          email: admin_email,
          password: hashedPassword,
          role: "SCHOOL_ADMIN",
        },
        { transaction: t }
      );

      await t.commit();

      return res.status(201).json({
        success: true,
        data: {
          school_id: school.id,
          code: school.code,
        },
      });
    } catch (err) {
      await t.rollback();

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // 📋 List schools
  async listSchools(req, res) {
    try {
      const schools = await School.findAll({
        attributes: ["id", "name", "code", "email", "status", "createdAt"],
      });

      res.json({ success: true, data: schools });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
