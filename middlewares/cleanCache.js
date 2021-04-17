const { clearCache } = require("../services/cach");

module.exports = async (req, res, next) => {
  await next();

  clearCache(req.user.id);
};
