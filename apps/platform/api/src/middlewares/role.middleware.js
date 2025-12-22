// apps/platform/api/src/middlewares/role.middleware.js
module.exports = (role) => {
  return (req, res, next) => {
    // role check later
    next();
  };
};
