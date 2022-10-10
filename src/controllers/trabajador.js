const { trabajador } = require("../../config/db");

const getTrabajador = async (req, res, next) => {
  try {
    const all = await Admin.findAll();
    console.log(all);
    res.status(200).json(all);
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const postTrabajador = async (req, res, next) => {
  const data = req.body;

  try {
  } catch (error) {}
};

module.exports = { getTrabajador, postTrabajador };
