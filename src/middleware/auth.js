const { verifyToken } = require("../helpers/generateToken");

const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization.split(" ").pop();
  const tokenData = await verifyToken(token);
  if (tokenData._id) {
    next();
  } else {
    req.status(409).send({ error: "Token invalido" });
  }
};

module.exports= checkAuth
