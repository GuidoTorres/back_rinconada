const jwt = require("jsonwebtoken");

const tokenSign = async (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.usuario,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );
};
const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {tokenSign, verifyToken};
