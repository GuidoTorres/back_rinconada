const { Sequelize } = require("sequelize");
const {
  pago,
  contrato,
  teletrans,
  evaluacion,
  trabajador,
  contrato_pago,
  asociacion,
} = require("../../config/db");
const { Op } = require("sequelize");

const createProgramacion = async (req, res, next) => {
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    estado: false,
    teletrans: req.body.teletrans,
    tipo: req.body.tipo,
  };

  try {
    if (parseInt(info.teletrans) % 4 !== 0) {
      res.status(400).json({
        msg: "Error! La cantidad de teletrans debe ser equivalente a un volquete.",
        status: 400,
      });
      next();
    } else {
      const post = await pago.create(info);
      let contra_pago = {
        teletrans: info.teletrans,
        contrato_id: req.body.contrato_id,
        pago_id: post.id,
      };
      const pagoContrato = await contrato_pago.create(contra_pago);
      res
        .status(200)
        .json({ msg: "Programación registrada con éxito!", status: 200 });
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

const createProgramacionMultiple = async (req, res, next) => {
  const info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    tipo: req.body.tipo,
    estado: false,
  };

  try {
    const totalTeletrans = req.body?.trabajadores?.reduce(
      (acc, value) => acc + parseFloat(value.teletrans),
      0
    );
    if (totalTeletrans % 4 === 0) {
      const post = await pago.create(info);
      let contra_pago = req.body.trabajadores.map((item) => {
        return {
          teletrans: item.teletrans,
          contrato_id: item.contrato_id,
          pago_id: post.id,
        };
      });
      const pagoContrato = await contrato_pago.bulkCreate(contra_pago);
      res
        .status(200)
        .json({ msg: "Programación registrada con éxito!", status: 200 });
      next();
    } else {
      res.status(400).json({
        msg: "Error! La cantidad de teletrans debe ser equivalente a 1 volquete.",
        status: 400,
      });
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo crear.", status: 500 });
  }
};

const updateProgramacion = async (req, res, next) => {
  let id = req.params.id;
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    contrato_id: req.body.contrato_id,
    teletrans: req.body.teletrans,
    trabajador: req.body.trabajador,
  };
  try {
    if (info.teletrans % 4 === 0) {
      if (info.trabajador.length > 0) {
        let update = await pago.update(info, { where: { id: id } });
        let data = {
          teletrans: info.teletrans,
        };
        let updateContatoPago = await contrato_pago.update({
          data,
          where: { pago_id: id },
        });
      }
      res
        .status(200)
        .json({ msg: "Programación actualizada con éxito!", status: 200 });
      next();
    } else {
      res.status(400).json({
        msg: "Error! La cantidad de teletrans debe ser equivalente a 1 o mas volquetes.",
        status: 400,
      });
      next();
    }
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const updateProgramacionMultiple = async (req, res, next) => {
  let pago_id = req.params.id;
  const totalTeletrans = req?.body?.trabajadores?.reduce(
    (acc, value) => acc + parseFloat(value.teletrans),
    0
  );
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    contrato_id: req.body.contrato_id,
    teletrans: totalTeletrans || req.body.teletrans,
  };
  try {
    if (!req.body.trabajadores) {
      let update = await pago.update(info, { where: { id: pago_id } });
      let data = {
        teletrans: info.teletrans,
      };
      let updateContratoPago = await contrato_pago.update(data, {
        where: { pago_id: pago_id },
      });

      return res
        .status(200)
        .json({ msg: "Programación actualizada con éxito!", status: 200 });
    }

    if (req?.body?.trabajadores?.length > 1 && totalTeletrans % 4 === 0) {
      let update = await pago.update(info, { where: { id: pago_id } });

      let contra_pago = req.body.trabajadores.map((item) => {
        return {
          teletrans: item.teletrans,
          contrato_id: item.contrato_id,
          pago_id: pago_id,
        };
      });
      const delPagoContrato = await contrato_pago.destroy({
        where: { pago_id: pago_id },
      });
      const pagoContrato = await contrato_pago.bulkCreate(contra_pago);
      return res
        .status(200)
        .json({ msg: "Programación actualizada con éxito!", status: 200 });
    } else {
      return res.status(400).json({
        msg: "Error! La cantidad de teletrans debe ser equivalente a 1 o mas volquetes.",
        status: 400,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

//para realizar el pago de trabajadores individuales, actualizar el saldo en la tabla teletrans
const postPago = async (req, res, next) => {
  let info = {
    hora: req?.body?.hora,
    placa: req?.body?.placa,
    propietario: req?.body?.propietario,
    trapiche: req.body?.trapiche,
    teletrans: parseInt(req.body?.teletrans),
    contrato_id: parseInt(req.body?.contrato_id),
    pago_id: parseInt(req.body.pago_id),
    estado: true,
  };
  let estadoContrato = {
    finalizado: true,
  };
  try {
    const saldo = await teletrans.findAll({
      raw: true,
      where: { contrato_id: info.contrato_id },
    });
    saldoResultado = parseInt(saldo?.at(-1)?.saldo) - parseInt(info?.teletrans);

    let newSaldo = {
      saldo: saldoResultado,
    };
    if (saldoResultado < 0) {
      return res.status(200).json({
        msg: "Error! la cantidad a pagar es mayor que el saldo adeudado al trabajador.",
        status: 200,
      });
    }
    if (req.body.teletrans === 4) {
      if (saldoResultado === 0) {
        const create = await pago.update(info, {
          where: { id: info.pago_id },
        });

        const updateTeletrans = await teletrans.update(newSaldo, {
          where: { contrato_id: req.body.contrato_id },
        });
        const updateContrato = await contrato.update(estadoContrato, {
          where: { id: req.body.contrato_id },
        });
        const updateEvaluacion = await evaluacion.update(estadoContrato, {
          where: { id: req.body[req.body.length - 1]?.evaluacion_id },
        });
        return res
          .status(200)
          .json({ msg: "Pago registrado con éxito!", status: 200 });
      } else {
        const create = await pago.update(info, {
          where: { id: info.pago_id },
        });
        const updateTeletrans = await teletrans.update(newSaldo, {
          where: { contrato_id: info.contrato_id },
        });
        return res
          .status(200)
          .json({ msg: "Pago registrado con éxito!", status: 200 });
      }
    } else {
      return res.status(200).json({
        msg: "Error! el pago solamente se puede realizar si los teletrans equivalen un volquete.",
        status: 200,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};
//para realizar el pago de multiples trabajadores, actualizar el saldo en la tabla teletrans

const postMultiplePagos = async (req, res, next) => {
  let info = {
    conductor: req.body.conductor,
    dni: req.body.dni,
    telefono: req.body.telefono,
    placa: req.body.placa,
    teletrans: parseInt(req.body.teletrans),
    lugar: req.body.lugar,
  };
  let estadoContrato = {
    finalizado: true,
  };
  try {
    const saldo = await teletrans.findAll({
      raw: true,
      where: { contrato_id: req.body.contrato_id },
    });

    saldoResultado = saldo.map((item) => {
      parseInt(item.saldo) - parseInt(info.teletrans);
    });
    dividirTeletrans = parseInt(info.teletrans) / saldo.length;
    saldoResultado = saldo.map((item) => {
      return {
        id: item.id,
        volquete: item.volquete,
        total: item.total,
        saldo:
          parseInt(item.saldo) - parseInt(info.teletrans) / dividirTeletrans,
      };
    });

    if (saldoResultado === 0) {
      const create = await pago.create(info);
      const updateTeletrans = await teletrans.update(saldoResultado, {
        where: { contrato_id: info.contrato_id },
      });
      const updateContrato = await contrato.update(estadoContrato, {
        where: { id: info.contrato_id },
      });
      const updateEvaluacion = await evaluacion.update(estadoContrato, {
        where: { id: req.body[req.body.length - 1]?.evaluacion_id },
      });
    } else {
      // const create = await pago.create(info);

      const update = saldoResultado.map((item, i) => saldoResultado[i]);
      // const updateTeletrans = await teletrans.update(saldoResultado, {
      //   where: { contrato_id: info.contrato_id },
      // });
      console.log(update);
    }
    res.status(200).json({ msg: "Registrado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

//para mostrar en el calendario las fechas programadas de los pagos
const getPagoFecha = async (req, res, next) => {
  let fecha = req.query.fecha;
  try {
    const get = await trabajador.findAll({
      where: {
        [Op.and]: [
          { asociacion_id: { [Op.is]: null } },
          { deshabilitado: { [Op.not]: true } },
        ],
      },
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          where: {
            [Op.and]: [{ finalizado: { [Op.not]: true } }],
          },
          include: [
            { model: teletrans },
            { model: pago, where: { fecha_pago: fecha } },
          ],
        },
      ],
    });

    const formatData = get.map((item) => {
      return {
        nombre:
          item.apellido_paterno +
          " " +
          item.apellido_materno +
          " " +
          item.nombre,
        celular: item.telefono,
        pago: item?.contratos
          ?.at(-1)
          ?.pagos?.map((data) =>
            parseInt(data.teletrans) % 4 !== 0
              ? data.teletrans + " Teletrans"
              : parseInt(data.teletrans) / 4 + " Volquete"
          )
          .toString(),
        observacion: item?.contratos
          ?.at(-1)
          ?.pagos?.map((data) => data.observacion)
          .toString(),
        pago_id: item?.contratos
          ?.at(-1)
          ?.pagos?.map((data) => data.id)
          .toString(),
        nombre:
          item.nombre +
          " " +
          item.apellido_paterno +
          " " +
          item.apellido_materno,
        dni: item.dni,
        cargo: item.contratos.at(-1).puesto,
        contrato_id: item.contratos.at(-1).id,
      };
    });
    res.status(200).json({ data: formatData, status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener.", status: 500 });
  }
};

const historialProgramacion = async (req, res, next) => {
  try {
    const get = await trabajador.findAll({
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: contrato,
          where: {
            [Op.not]: [{ id: null }],
          },
          attributes: { exclude: ["contrato_id"] },
          include: [
            {
              model: contrato_pago,
              where: {
                [Op.not]: [{ id: null }],
              },
              include: [
                {
                  model: pago,
                  where: {
                    [Op.not]: [{ estado: false }],
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const formatData = get.map((item, i) => {
      return {
        id: i + 1,
        nombre:
          item?.nombre +
          " " +
          item?.apellido_paterno +
          " " +
          item?.apellido_materno,
        celular: item?.telefono,
        cargo: item?.contratos?.at(-1)?.puesto || "---",
        pagos: item?.contratos
          ?.map((data) => data.contrato_pagos)
          .flat()
          .map((data) => {
            return {
              id: data.pago.id,
              hora: data.pago.hora,
              placa: data.pago.placa,
              propietario: data.pago.propietario,
              trapiche: data.pago.trapiche,
              teletrans: data.pago.teletrans,
              observacion: data.pago.observacion,
              fecha_pago: data.pago.fecha_pago,
              tipo: data.pago.tipo,
              estado: data.pago.estado,
            };
          }),
      };
    });

    res.status(200).json({ data: formatData, status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener.", status: 500 });
  }
};

const deletePago = async (req, res, next) => {
  let id = req.params.id;
  try {
    let del = await pago.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Pago eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};
module.exports = {
  postPago,
  postMultiplePagos,
  createProgramacion,
  getPagoFecha,
  deletePago,
  historialProgramacion,
  createProgramacionMultiple,
  updateProgramacion,
  updateProgramacionMultiple,
};
