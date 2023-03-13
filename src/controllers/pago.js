const dayjs = require("dayjs");
const { filter } = require("lodash");
const { where } = require("sequelize");
const {
  pago,
  contrato,
  teletrans,
  evaluacion,
  trabajador,
  contrato_pago,
  asociacion,
  ayuda_pago,
  empresa,
  destino,
  destino_pago,
  pago_asociacion,
  trabajadorAsistencia,
  asistencia,
} = require("../../config/db");

const createProgramacion = async (req, res, next) => {
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    estado: "programado",
    teletrans: req.body.teletrans,
    tipo: req.body.tipo,
  };

  try {
    if (req.body.contrato_id) {
      if (parseInt(info.teletrans) % 4 !== 0) {
        return res.status(400).json({
          msg: "Error! La cantidad de teletrans debe ser equivalente a un volquete.",
          status: 400,
        });
      } else {
        const post = await pago.create(info);
        let contra_pago = {
          teletrans: info.teletrans,
          contrato_id: req.body.contrato_id,
          pago_id: post.id,
        };
        const pagoContrato = await contrato_pago.create(contra_pago);
        return res
          .status(200)
          .json({ msg: "Programación registrada con éxito!", status: 200 });
      }
    } else {
      return res.status(400).json({
        msg: "Error! Falta el id del contrato.",
        status: 400,
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

const createProgramacionMultiple = async (req, res, next) => {
  const info = {
    observacion: req?.body?.observacion,
    fecha_pago: req?.body?.fecha_pago,
    tipo: req?.body?.tipo,
    estado: "programado",
    teletrans: req?.body?.teletrans,
    volquetes: req?.body?.volquetes,
  };

  try {
    const totalTeletrans = req.body?.trabajadores?.reduce(
      (acc, value) => acc + parseFloat(value.teletrans),
      0
    );
    if (info.teletrans % 4 === 0) {
      if (req?.body?.trabajadores?.length > 0) {
        console.log("digimon");

        const post = await pago.create(info);
        let contra_pago = req.body.trabajadores.map((item) => {
          return {
            contrato_id: item.contrato_id,
            pago_id: post.id,
            volquetes: req.body.volquetes,
            teletrans: info.teletrans,
          };
        });
        const pagoContrato = await contrato_pago.bulkCreate(contra_pago);
        return res
          .status(200)
          .json({ msg: "Programación registrada con éxito!", status: 200 });
      }

      //=====================================
      if (req?.body?.asociacion?.length > 0) {
        console.log("pokemon");
        const post = await pago.create(info);
        let contra_pago = {
          contrato_id: req.body.contrato_id,
          pago_id: post.id,
          volquetes: req.body.volquetes,
          teletrans: info.teletrans,
        };

        const pagoContrato = await contrato_pago.create(contra_pago);

        let asociacionPago = req.body.asociacion.map((item) => {
          return {
            teletrans: item.teletrans,
            trabajador_dni: item.trabajador_dni,
            contrato_pago_id: pagoContrato.id,
          };
        });

        const asociPago = await pago_asociacion.bulkCreate(asociacionPago);
        res
          .status(200)
          .json({ msg: "Programación registrada con éxito!", status: 200 });
      }
    } else {
      return res.status(400).json({
        msg: "Error! La cantidad de teletrans debe ser equivalente a 1 volquete.",
        status: 400,
      });
    }
    next();
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
  };
  try {
    if (info.teletrans % 4 === 0) {
      let updatePAgo = await pago.update(info, { where: { id: id } });
      let data = {
        teletrans: info.teletrans,
      };
      let updateContratoPago = await contrato_pago.update(data, {
        where: { pago_id: id },
      });
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
    console.log(error);
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
  };
  let estadoContrato = {
    finalizado: "completado",
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
        const create = await destino.create(info);

        const data = {
          destino_id: create.id,
          pago_id: info.pago_id,
          estado: "completado",
        };

        const pagoEstado = {
          estado: "completado",
        };

        const updateEstado = await pago.update(pagoEstado, {
          where: { id: req.body.pago_id },
        });
        console.log(updateEstado);

        const pagoDestino = await destino_pago.create(data);
        //actualiza el saldo
        const updateTeletrans = await teletrans.update(newSaldo, {
          where: { contrato_id: req.body.contrato_id },
        });
        //finaliza el contrato si el saldo llega a 0
        const updateContrato = await contrato.update(estadoContrato, {
          where: { id: req.body.contrato_id },
        });

        //finaliza la evalucacion si el saldo llega a 0
        const updateEvaluacion = await evaluacion.update(estadoContrato, {
          where: { id: req.body[req.body.length - 1]?.evaluacion_id },
        });
        return res
          .status(200)
          .json({ msg: "Pago registrado con éxito!", status: 200 });
      } else {
        const create = await destino.create(info);
        const data = {
          destino_id: create.id,
          pago_id: info.pago_id,
        };
        const pagoDestino = await destino_pago.create(data);
        const pagoEstado = {
          estado: "completado",
        };

        const updateEstado = await pago.update(pagoEstado, {
          where: { id: req.body.pago_id },
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
        msg: "Error! el pago solamente se puede realizar si los teletrans equivalen a 1 o más volquetes.",
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
  let estadoContrato = {
    finalizado: true,
  };

  let info = {
    pago_id: req?.body?.pago_id,
    hora: req?.body?.hora,
    placa: req?.body?.placa,
    propietario: req?.body?.propietario,
    trapiche: req?.body?.trapiche,
    teletrans: req?.body?.teletrans,
    asociacion_id: req.body.asociacion_id,
  };

  //ids de contrato de trabajadores
  const ids = req?.body?.trabajadores?.map((item) => item.contrato_id);
  try {
    const saldo = await teletrans.findAll({
      raw: true,
      where: { contrato_id: ids },
    });

    const totalTeletrans = saldo.map((item) => {
      return {
        id: item.id,
        contrato_id: item.contrato_id,
        saldo: parseFloat(item.saldo),
      };
    });

    // el resultado de restar el saldo de tabla teletrasn - los teletrans a pagar
    let result = totalTeletrans.map((item) => {
      const resta = req.body.trabajadores.find(
        (el) => el.contrato_id === item.contrato_id
      );
      if (resta) {
        return {
          ...item,
          saldo: parseFloat(item.saldo) - parseFloat(resta.teletrans),
        };
      } else {
        return item;
      }
    });

    const filterContratoTerminado = result.filter((item) => item.saldo === 0);
    // suma de los ttrans para validar si es un volquete
    const ttransTotal = req?.body?.trabajadores.reduce((acc, value) => {
      return parseFloat(acc.teletrans) + parseFloat(value.teletrans);
    });

    if (ttransTotal === 4) {
      const create = await destino.create(info);

      const data = {
        destino_id: create.id,
        pago_id: info.pago_id,
        estado: "completado",
      };
      const pagoEstado = {
        estado: "completado",
      };
      const pagoDestino = await destino_pago.create(data);
      const updatePago = await pago.update(pagoEstado, {
        where: {
          id: info.pago_id,
        },
      });

      const updateTeletrans = result.map(
        async (item) =>
          await teletrans.update(
            { saldo: item.saldo },
            {
              where: { id: item.id },
            }
          )
      );

      if (filterContratoTerminado.length > 0) {
        // revisar que cambie el estado del contrato, ademas validar que no se pague mas de lo que se debe
        const idsContratos = filterContratoTerminado.map(
          (item) => item.contrato_id
        );
        const updateContrato = await contrato.update(estadoContrato, {
          where: { id: idsContratos },
        });
        // const updateEvaluacion = await evaluacion.update(estadoContrato, {
        //   where: { id: req.body[req.body.length - 1]?.evaluacion_id },
        // });
      }
    } else {
      return res.status(400).json({
        msg: "Error! el monto a pagar debe ser equivalente a 1 volquete.",
        status: 400,
      });
    }

    res.status(200).json({ msg: "Pago realizado con éxito!", status: 200 });
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
    const getPago = await pago.findAll({
      where: { fecha_pago: fecha },
      include: [
        {
          model: contrato_pago,
          attributes: { exclude: ["contrato_pago_id"] },
          include: [
            { model: pago_asociacion },
            {
              model: contrato,

              attributes: { exclude: ["contrato_id"] },
              include: [
                { model: trabajador, attributes: { exclude: ["usuarioId"] } },
                { model: empresa },
                { model: asociacion },
              ],
            },
          ],
        },
        {
          model: ayuda_pago,
          include: [
            { model: trabajador, attributes: { exclude: ["usuarioId"] } },
          ],
        },
      ],
    });

    const formatAsociacion = getPago
      .filter(
        (item) => item?.contrato_pagos?.at(-1)?.pago_asociacions?.length > 0
      )
      .map((item) => {
        return {
          observacion: item?.observacion,
          fecha_pago: item?.fecha_pago,
          tipo: item?.tipo,
          estado: item?.estado,
          volquetes: item?.volquetes,
          teletrans: item?.teletrans,
          pagos: item?.contrato_pagos?.map((data) => {
            return {
              contrato_id: data?.contrato_id,
              pago_id: data?.pago_id,
              asociacion_id: data?.contrato?.asociacion?.id,
              nombre: data?.contrato?.asociacion?.nombre,
              tipo_asociacion: data?.contrato?.asociacion?.tipo,
              area: "---",
              cargo: "---",
              celular: "---",
              dni: "---",
              trabajadores: data?.pago_asociacions,
            };
          }),
        };
      });

    const formatAyuda = getPago
      .filter(
        (item) =>
          item?.contrato_pagos?.at(-1)?.pago_asociacions?.length === 0 &&
          item?.ayuda_pagos.length > 0
      )
      .map((item) => {
        return {
          observacion: item?.observacion,
          fecha_pago: item?.fecha_pago,
          tipo: item?.tipo,
          estado: item?.estado,
          volquetes: item?.volquetes,
          teletrans: item?.teletrans,
          pagos: item?.contrato_pagos?.map((data) => {
            return {
              contrato_id: "---",
              pago_id: data?.pago_id,
              nombre:
                data?.trabajador?.nombre +
                " " +
                data?.trabajador?.apellido_paterno +
                " " +
                data?.trabajador?.apellido_materno,
              area: "---",
              cargo: "---",
              celular: data?.trabajador?.telefono,
              dni: data?.trabajador?.dni,
              teletrans: data?.teletrans,
            };
          }),
        };
      });

    const formatPagoNormal = getPago
      .filter(
        (item) =>
          item?.contrato_pagos?.at(-1)?.pago_asociacions?.length === 0 &&
          item?.ayuda_pagos.length === 0 &&
          item.contrato_pagos.length > 0
      )
      .map((item) => {
        return {
          observacion: item?.observacion,
          fecha_pago: item?.fecha_pago,
          tipo: item?.tipo,
          estado: item?.estado,
          volquetes: item?.volquetes,
          teletrans: item?.teletrans,
          pagos: item?.contrato_pagos?.map((data) => {
            return {
              contrato_id: data?.contrato_id,
              pago_id: data?.pago_id,
              nombre:
                data?.contrato?.trabajador !== null
                  ? data?.contrato?.trabajador?.nombre +
                    " " +
                    data?.contrato?.trabajador?.apellido_paterno +
                    " " +
                    data?.contrato?.trabajador?.apellido_materno
                  : data?.contrato?.empresa?.razon_social,
              area: data?.contrato?.area,
              cargo: data?.contrato?.puesto,
              celular: data?.contrato?.trabajador?.telefono,
              dni: data?.contrato?.trabajador?.dni,
              teletrans: data?.teletrans,
            };
          }),
        };
      });

    const concatData = formatAsociacion.concat(formatAyuda);
    const concat2 = concatData
      .concat(formatPagoNormal)
      .filter((item) => item.estado === "programado");

    res.status(200).json({ data: concat2, status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener.", status: 500 });
  }
};

const historialProgramacion = async (req, res, next) => {
  try {
    const getPago = await pago.findAll({
      // where: { estado: "completado" },
      include: [
        { model: destino_pago, include: [{ model: destino }] },
        {
          model: contrato_pago,
          attributes: { exclude: ["contrato_pago_id"] },

          include: [
            { model: pago_asociacion },
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },
              include: [
                {
                  model: trabajador,
                  attributes: { exclude: ["usuarioId"] },
                  include: [
                    {
                      model: trabajadorAsistencia,
                      attributes: {
                        exclude: [
                          "trabajadorId",
                          "asistenciumId",
                          "trabajadorDni",
                        ],
                      },
                      include: [{ model: asistencia }],
                    },
                  ],
                },
                { model: empresa },
                { model: asociacion },
              ],
            },
          ],
        },
        {
          model: ayuda_pago,
        },
      ],
    });

    const formatAsociacion = getPago
      .filter(
        (item) => item?.contrato_pagos?.at(-1)?.pago_asociacions?.length > 0
      )
      .map((item) => {
        return {
          hora: item?.hora,
          observacion: item?.observacion,
          fecha_pago: item?.fecha_pago,
          tipo: item?.tipo,
          estado: item?.estado,
          volquete:
            parseFloat(item?.teletrans) % 4 === 0
              ? parseFloat(item?.teletrans) / 4
              : 0,
          teletrans:
            parseFloat(item?.teletrans) % 4 === 0
              ? 0
              : parseFloat(item?.teletrans),
          destino: item?.destino_pagos,
          asociacion: item?.contrato_pagos?.map((data) => {
            return {
              contrato_id: data?.contrato_id,
              pago_id: data?.pago_id,
              asociacion_id: data?.contrato?.asociacion?.id,
              nombre: data?.contrato?.asociacion?.nombre,
              tipo_asociacion: data?.contrato?.asociacion?.tipo,
              area: "---",
              cargo: "---",
              celular: "---",
              dni: "---",
              fecha_inicio: dayjs(data?.contrato?.fecha_inicio).format(
                "YYYY-MM-DD"
              ),
              fecha_fin: dayjs(data?.contrato?.fecha_inicio)
                .add(14, "day")
                .format("YYYY-MM-DD"),

              trabajadores: data?.pago_asociacions,
            };
          }),
        };
      })
      .filter((item) => item.estado !== "programado");

    const formatAyuda = getPago
      .filter(
        (item) =>
          item?.contrato_pagos?.at(-1)?.pago_asociacions?.length === 0 &&
          item?.ayuda_pagos.length > 0
      )
      .map((item) => {
        return {
          observacion: item?.observacion,
          fecha_pago: item?.fecha_pago,
          tipo: item?.tipo,
          estado: item?.estado,

          volquete:
            parseFloat(item?.teletrans) % 4 === 0
              ? parseFloat(item?.teletrans) / 4
              : 0,
          teletrans:
            parseFloat(item?.teletrans) % 4 === 0
              ? 0
              : parseFloat(item?.teletrans),
          destino: item?.destino_pagos,
          trabajadores: item?.contrato_pagos?.map((data) => {
            return {
              contrato_id: "---",
              pago_id: data?.pago_id,
              nombre:
                data?.trabajador?.nombre +
                " " +
                data?.trabajador?.apellido_paterno +
                " " +
                data?.trabajador?.apellido_materno,
              area: "---",
              cargo: "---",
              celular: data?.trabajador?.telefono,
              dni: data?.trabajador?.dni,
            };
          }),
        };
      })
      .filter((item) => item.estado !== "programado");

    const formatPagoNormal = getPago
      .filter(
        (item) =>
          item?.contrato_pagos?.at(-1)?.pago_asociacions?.length === 0 &&
          item?.ayuda_pagos.length === 0 &&
          item.contrato_pagos.length > 0
      )
      .map((item) => {
        return {
          observacion: item?.observacion,
          fecha_pago: item?.fecha_pago,
          tipo: item?.tipo,
          estado: item?.estado,
          volquete:
            parseFloat(item?.teletrans) % 4 === 0
              ? parseFloat(item?.teletrans) / 4
              : 0,
          teletrans:
            parseFloat(item?.teletrans) % 4 === 0
              ? 0
              : parseFloat(item?.teletrans),
          destino: item?.destino_pagos,
          trabajadores: item?.contrato_pagos?.map((data, i) => {
            return {
              contrato_id: data?.contrato_id,
              pago_id: data?.pago_id,
              nombre:
                data?.contrato?.trabajador !== null
                  ? data?.contrato?.trabajador?.nombre +
                    " " +
                    data?.contrato?.trabajador?.apellido_paterno +
                    " " +
                    data?.contrato?.trabajador?.apellido_materno
                  : data?.contrato?.empresa?.razon_social,
              area: data?.contrato?.area,
              cargo: data?.contrato?.puesto,
              celular: data?.contrato?.trabajador?.telefono,
              dni: data?.contrato?.trabajador?.dni,
              fecha_inicio:
                data?.contrato?.trabajador?.trabajador_asistencia?.at(
                  (i + 1 - 1) * 15
                )?.asistencium?.fecha,
              fecha_fin: data?.contrato?.trabajador?.trabajador_asistencia?.at(
                (i + 1 - 1) * 15 + 14
              )?.asistencium?.fecha,
            };
          }),
        };
      })
      .filter((item) => item.estado !== "programado");

    const concatData = formatAsociacion.concat(formatAyuda);
    const concat2 = concatData.concat(formatPagoNormal);

    res.status(200).json({ data: concat2, status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener.", status: 500 });
  }
};

const deletePago = async (req, res, next) => {
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

    return res
      .status(200)
      .json({ msg: "Pago eliminado con éxito!", status: 200 });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

const validacionPago = async (req, res, next) => {
  let id = req.params.id;
  try {
    let updateEstado = {
      estado: "pagado",
    };

    const updaPago = await pago.update(updateEstado, {
      where: { id: id },
    });

    const updatePagoDestino = await destino_pago.update(updateEstado, {
      where: { pago_id: id },
    });

    res
      .status(200)
      .json({ msg: "Validación de pago realizada con éxito!.", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error.", status: 500 });
  }
};

const reprogramacionPago = async (req, res, next) => {
  let info = {
    pago_id: req.body.pago_id,
    destino_id: req.body.destino_id,
    tipo: req.body.tipo,
    estado: req.body.estado,
  };

  try {
    if (info.estado === "completado") {
      const getPago = await pago.findAll({
        where: { id: info.pago_id },
        include: [
          {
            model: contrato_pago,
            attributes: { exclude: ["contrato_pago_id"] },
          },
        ],
      });

      const filterPago = getPago.filter(
        (item) => item.contrato_pagos.length > 0
      );
      let observacionData = {
        observacion: req?.body?.observacion,
      };
      const updatePago = await pago.update(observacionData, {
        where: { id: info.pago_id },
      });

      if (filterPago.length > 0) {
        let ids = getPago
          ?.map((item) => item?.contrato_pagos?.map((data) => data.contrato_id))
          .flat();

        const getTeletrans = await teletrans.findAll({
          where: { contrato_id: ids },
        });

        let contra_pago = getPago
          ?.map((item) =>
            item?.contrato_pagos?.map((data) => {
              return {
                contrato_id: data.contrato_id,
                teletrans: data.teletrans,
              };
            })
          )
          .flat();

        const joinData = getTeletrans.map((item) => {
          const data = contra_pago.find(
            (ele) => ele.contrato_id === item.contrato_id
          );

          if (data) {
            return {
              contrato_id: item.contrato_id,
              teletrans:
                parseFloat(item.teletrans) + parseFloat(data.teletrans),
            };
          }
        });

        const updateTeletrans = joinData.map(async (item) => {
          await teletrans.update(item.teletrans, {
            where: { contrato_id: item.contrato_id },
          });
        });
      }

      const delDestinoPago = await destino_pago.destroy({
        where: { destino_id: info.destino_id },
      });
      const delDestino = await destino.destroy({
        where: { id: info.destino_id },
      });

      const newDate = new Date();
      const day = dayjs(newDate).format("YYYY-MM-DD");
      let state = {
        estado: "programado",
        fecha_pago: day,
      };

      const updateState = await pago.update(state, {
        where: { id: info.pago_id },
      });

      return res.status(200).json({
        msg: "Se realizo la reprogramación correctamente.",
        status: 200,
      });
    } else {
      return res.status(500).json({
        msg: "No es posible realizar la reprogramación.",
        status: 500,
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hubo un error.", status: 500 });
  }
};

const BusquedaPagos = async (req, res, next) => {
  const { term, sortBy } = req.query;

  try {
    if (term) {
      const product = await trabajador.findAll({
        where: {
          nombre: {
            [Op.like]: "%" + term + "%",
          },
        },
        include: [{ model: contrato, include: [{ model: contrato_pago }] }],
        // order: orderElements(sortBy),
      });
      return res.status(200).json({
        data: product,
      });
    }
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const asociacionPago = async (req, res, next) => {
  try {
    let info = {
      hora: req.body.hora,
      placa: req.body.placa,
      propietario: req.body.propietario,
      trapiche: req.body.trapiche,
      volquetes: req.body.volquetes,
      teletrans: req.body.teletrans,
    };

    const saldo = await teletrans.findAll({
      raw: true,
      where: { contrato_id: req.body.contrato_id },
    });

    const totalTeletrans = saldo.map((item) => {
      return {
        id: item.id,
        contrato_id: item.contrato_id,
        saldo: parseFloat(item.saldo),
      };
    });

    // el resultado de restar el saldo de la tabla teletrans - los teletrans a pagar
    // let result = totalTeletrans.map((item) => {
    //   const resta = req.body.trabajadores.find(
    //     (el) => el.contrato_id === item.contrato_id
    //   );
    //   if (resta) {
    //     return {
    //       ...item,
    //       saldo: parseFloat(item.saldo) - parseFloat(resta.teletrans),
    //     };
    //   } else {
    //     return item;
    //   }
    // });

    // const filterContratoTerminado = result.filter((item) => item.saldo === 0);
    // // suma de los ttrans para validar si es un volquete

    const create = await destino.create(info);

    const data = {
      destino_id: create.id,
      pago_id: req.body.pago_id,
      estado: "completado",
    };
    const pagoEstado = {
      estado: "completado",
    };
    const pagoDestino = await destino_pago.create(data);
    const updatePago = await pago.update(pagoEstado, {
      where: {
        id: req.body.pago_id,
      },
    });

    // const updateTeletrans = result.map(
    //   async (item) =>
    //     await teletrans.update(
    //       { saldo: item.saldo },
    //       {
    //         where: { id: item.id },
    //       }
    //     )
    // );

    // if (filterContratoTerminado.length > 0) {
    //   // revisar que cambie el estado del contrato, ademas validar que no se pague mas de lo que se debe
    //   const idsContratos = filterContratoTerminado.map(
    //     (item) => item.contrato_id
    //   );
    //   const updateContrato = await contrato.update(estadoContrato, {
    //     where: { id: idsContratos },
    //   });
    //   // const updateEvaluacion = await evaluacion.update(estadoContrato, {
    //   //   where: { id: req.body[req.body.length - 1]?.evaluacion_id },
    //   // });
    // }

    res.status(200).json({ msg: "Pago realizado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo realizar el pago.", status: 500 });
  }
};
const deletePagoAsociacion = async (req, res, next) => {
  let id = req.params.id;
  try {
    const getDestinoPago = await destino_pago.findAll({
      where: { pago_id: id },
    });

    const getContratoPago = await contrato_pago.findAll({
      where: { pago_id: id }, attributes:{exclude:["contrato_pago_id"]}
    });

    const ids = getDestinoPago.map((item) => item.destino_id);
    const idsContratoPago = getContratoPago.map((item) => item.id);
    let delDestinoPago = await destino_pago.destroy({
      where: { pago_id: id },
    });
    let delDestino = await destino.destroy({ where: { id: ids } });
    let delAyudaPago = await pago_asociacion.destroy({
      where: { contrato_pago_id: idsContratoPago },
    });
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
  postPago,
  postMultiplePagos,
  createProgramacion,
  getPagoFecha,
  deletePago,
  historialProgramacion,
  createProgramacionMultiple,
  updateProgramacion,
  updateProgramacionMultiple,
  validacionPago,
  reprogramacionPago,
  BusquedaPagos,
  asociacionPago,
  deletePagoAsociacion,
};
