const { saldo } = require("../../config/db");

const getSaldo = async (req, res, next) => {
  try {
    const all = await saldo.findAll();
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getSaldoById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const all = await saldo.findAll({
      where: { sucursal_id: id },
    });
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

module.exports = { getSaldo, getSaldoById };
