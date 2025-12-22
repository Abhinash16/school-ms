// apps/client/school-api/src/server.js
require("dotenv").config();
const app = require("./app");

const { sequelize } = require("../../../../packages/db/models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected (school-api)");

    app.listen(PORT, () => {
      console.log(`🚀 School API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error", err);
    process.exit(1);
  }
})();
