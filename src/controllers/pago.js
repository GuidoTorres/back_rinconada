const { Sequelize } = require("sequelize");
const { pago, contrato, teletrans, evaluacion } = require("../../config/db");

const postPago = async (req, res, next) => {
  let info = {
    conductor: req.body[req.body.length - 1]?.conductor,
    dni: req.body[req.body.length - 1]?.dni,
    telefono: req.body[req.body.length - 1]?.telefono,
    placa: req.body[req.body.length - 1]?.placa,
    teletrans: parseInt(req.body[req.body.length - 1]?.teletrans),
    lugar: req.body[req.body.length - 1]?.lugar,
    contrato_id: parseInt(req.body[req.body.length - 1]?.contrato_id),
  };
  console.log(req.body[req.body.length - 1]?.evaluacion_id);
  let estadoContrato = {
    finalizado: true,
  };
  try {
    const saldo = await teletrans.findAll({
      raw: true,
      where: { contrato_id: info.contrato_id },
    });
    saldoResultado =
      parseInt(saldo[saldo.length - 1].saldo) - parseInt(info.teletrans);

    let newSaldo = {
      saldo: saldoResultado,
    };
    if (saldoResultado === 0) {
      const create = await pago.create(info);
      const updateTeletrans = await teletrans.update(newSaldo, {
        where: { contrato_id: info.contrato_id },
      });
      const updateContrato = await contrato.update(estadoContrato, {
        where: { id: info.contrato_id },
      });
      const updateEvaluacion = await evaluacion.update(estadoContrato, {
        where: { id: req.body[req.body.length - 1]?.evaluacion_id },
      });
    } else {
      const create = await pago.create(info);
      const updateTeletrans = await teletrans.update(newSaldo, {
        where: { contrato_id: info.contrato_id },
      });
    }
    res.status(200).json({ msg: "Registrado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

const postMultiplePagos = async (req, res, next) => {
  try {
    const create = await pago.bulkCreate(req.body);
    res.status(200).json({ msg: "Registrado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

module.exports = { postPago, postMultiplePagos };
