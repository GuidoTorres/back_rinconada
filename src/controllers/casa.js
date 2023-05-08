const {
  contrato_pago,
  pago,
  empresa,
  contrato,
  destino,
  destino_pago,
  trabajador,
} = require("../../config/db");

const getEmpresaPago = async (req, res, next) => {
  try {
    const get = await contrato_pago.findAll({
      attributes: { exclude: "contrato_pago_id" },
      include: [
        {
          model: pago,
          where: { tipo: "casa" },
        },
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [{ model: empresa }],
        },
      ],
    });

    const formatData = get
      .map((item) => {
        return {
          id: item?.id,
          pago_id: item.pago_id,
          razon_social: item?.contrato?.empresa?.razon_social,
          ruc: item?.contrato?.empresa?.ruc,
          contrato_id: item?.contrato?.id,
          pago: item.pago,
        };
      })
      .filter(
        (item) =>
          Object.keys(item.pago).length > 0 && item.pago.estado !== "completado"
      );

    return res.status(200).json({ data: get });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

const createProgramacionCasa = async (req, res, next) => {
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    estado: "programado",
    teletrans: req.body.teletrans,
    volquetes: req.body.volquetes,
    tipo: req.body.tipo,
  };

  const totalTtrans =
    parseFloat(info.volquetes) * 4 + parseFloat(info.teletrans);
  try {
    const get = await contrato_pago.findAll({
      where: { contrato_id: req.body.contrato_id },
      attributes: { exclude: ["contrato_pago_id"] },
      include: [{ model: pago }],
    });

    if (totalTtrans < 4) {
      return res.status(400).json({
        msg: "Error! La cantidad de teletrans debe ser equivalente o mayor a 1 volquete.",
        status: 400,
      });
    } else {
      const post = await pago.create(info);
      let contra_pago = {
        teletrans: info.teletrans,
        volquetes: info.volquetes,
        contrato_id: req.body.contrato_id,
        pago_id: post.id,
      };
      const pagoContrato = await contrato_pago.create(contra_pago);
      return res
        .status(200)
        .json({ msg: "Programación registrada con éxito!", status: 200 });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

//para realizar el pago de trabajadores individuales, actualizar el saldo en la tabla teletrans
const postPagoCasa = async (req, res, next) => {
  let info = {
    hora: req?.body?.hora,
    placa: req?.body?.placa,
    propietario: req?.body?.propietario,
    trapiche: req.body?.trapiche,
    teletrans: 0,
    contrato_id: parseInt(req.body?.contrato_id),
    pago_id: parseInt(req.body.pago_id),
    volquetes: parseInt(req.body.volquetes),
    estado: "completado",
  };

  try {
    if (req.body.volquete % 4 === 0) {
      const create = await pago.update(info, {
        where: { id: info.pago_id },
      });
      return res
        .status(200)
        .json({ msg: "Pago registrado con éxito!", status: 200 });
    } else {
      return res.status(200).json({
        msg: "Error! el pago solamente se puede realizar si los teletrans equivalen a 1 volquete.",
        status: 200,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};
const postPagoCasaMultiple = async (req, res, next) => {
  try {
    if (req.body.volquetes >= 1) {
      const create = await destino.bulkCreate(req.body.destino);
      const destinoCreate = create.map((item) => {
        return {
          destino_id: item.id,
          pago_id: req.body.pago_id,
          estado: "completado",
        };
      });

      const dest = await destino_pago.bulkCreate(destinoCreate, {
        ignoreDuplicates: false,
      });
      const pagoEstado = {
        estado: "completado",
      };
      const updatePago = await pago.update(pagoEstado, {
        where: {
          id: req.body.pago_id,
        },
      });
      return res
        .status(200)
        .json({ msg: "Pago realizado con éxito!", status: 200 });
    } else {
      return res.status(400).json({
        msg: "Error! el monto a pagar debe ser igual o mayor a 1 volquete.",
        status: 400,
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

const updateProgramacionCasa = async (req, res, next) => {
  let id = req.params.id;
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    teletrans: req.body.teletrans,
    volquetes: req.body.volquetes,
  };

  const totalTtrans =
    parseFloat(info.volquetes) * 4 + parseFloat(info.teletrans);

  try {
    let update = await pago.update(info, { where: { id: id } });
    let data = {
      teletrans: info.teletrans,
      volquetes: info.volquetes,
    };
    let updateContatoPago = await contrato_pago.update(data, {
      where: { pago_id: id },
    });

    return res
      .status(200)
      .json({ msg: "Programación actualizada con éxito!", status: 200 });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};
const deletePagoCasa = async (req, res, next) => {
  let id = req.params.id;
  try {
    const getDestinoPago = await destino_pago.findAll({
      where: { pago_id: id },
    });

    const ids = getDestinoPago.map((item) => item.destino_id);
    let delDestinoPago = await destino_pago.destroy({ where: { pago_id: id } });
    let delDestino = await destino.destroy({ where: { id: ids } });

    let delContratoPago = await contrato_pago.destroy({
      where: { pago_id: id },
    });
    let del = await pago.destroy({ where: { id: id } });
    if (delContratoPago === 0 && del === 0) {
      return res
        .status(404)
        .json({ msg: "No se encontró el pago.", status: 404 });
    } else {
      return res
        .status(200)
        .json({ msg: "Pago eliminado con éxito!", status: 200 });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

module.exports = {
  createProgramacionCasa,
  postPagoCasa,
  updateProgramacionCasa,
  deletePagoCasa,
  getEmpresaPago,
  postPagoCasaMultiple,
};
