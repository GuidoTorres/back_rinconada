const { gerencia, area } = require("../../config/db");

const getGerencia = async (req, res, next) => {
  try {
    const all = await gerencia.findAll();
    return res.status(200).json({data:all});
    next();
  } catch (error) {
    res.status(500).json();
  }
};

module.exports={getGerencia}