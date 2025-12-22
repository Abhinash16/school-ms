// apps/platform/api/src/server.js

const { sequelize } = require("../../../../packages/db");
const app = require("./app");

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Database connected & synced");
    app.listen(PORT, () => {
      console.log(`🚀 Platform API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
})();
