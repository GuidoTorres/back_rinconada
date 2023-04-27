const { aprobacion_contrato_pago } = require("../../config/db");

const getAprobacion = async (req, res, next) => {
  try {
    const all = await aprobacion_contrato_pago.findAll({});
    return res.status(200).json({ data: all });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

module.exports = { getAprobacion };
