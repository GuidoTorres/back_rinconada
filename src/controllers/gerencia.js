const { gerencia } = require("../../config/db");

const getGerencia = async (req, res, next) => {
  try {
    const all = await gerencia.findAll();
    res.status(200).json({data:all});
    next();
  } catch (error) {
    res.status(500).json();
  }
};

module.exports={getGerencia}