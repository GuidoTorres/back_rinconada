const { pago, contrato } = require("../../config/db");

const postPago = async (req, res, next) => {
  let info = {
    conductor: req.body.map((item) => item.conductor).toString(),
    dni: req.body.map((item) => item.dni).toString(),
    telefono: req.body.map((item) => item.telefono).toString(),
    placa: req.body.map((item) => item.placa).toString(),
    teletrans: parseInt(req.body.map((item) => item.teletrans)),
    lugar: req.body.map((item) => item.lugar).toString(),
    contrato_id: parseInt(req.body.map((item) => item.contrato_id)),
  };
  console.log(info);
  let estadoContrato = {
    estado: true,
  };
  try {
    const create = await pago.create(info);
    const updateContrato = await contrato.update(estadoContrato, {
      where: { id: info.contrato_id },
    });
    console.log(create);
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
