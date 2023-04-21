const {
  campamento,
  trabajador,
  contrato,
  teletrans,
  pago,
  contrato_pago,
  destino_pago,
  destino,
  trabajador_contrato,
} = require("../../config/db");
const { Op } = require("sequelize");

const getIncentivo = async (req, res, next) => {
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
          model: trabajador_contrato,
          include: [
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },
              where: {
                [Op.and]: [{ finalizado: { [Op.not]: true } }],
              },
              include: [
                {
                  model: contrato_pago,
                  attributes: { exclude: ["contrato_pago_id"] },
                  include: [
                    {
                      model: pago,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const getPago = await pago.findAll({
      include: [
        {
          model: contrato_pago,
          attributes: { exclude: ["contrato_pago_id"] },
          include: [
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },

              include: [
                {
                  model: trabajador_contrato,
                  include: [
                    {
                      model: trabajador,
                      // where: {
                      //   [Op.and]: [
                      //     { asociacion_id: { [Op.is]: null } },
                      //     { deshabilitado: { [Op.not]: true } },
                      //   ],
                      // },
                      attributes: { exclude: ["usuarioId"] },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const filterIncentivo = getPago.filter(
      (item) => item?.tipo === "incentivo"
    );

    // const formatData = filterContratoPago.map((item) => {
    //   return {
    //     nombre:
    //       item?.apellido_paterno +
    //       " " +
    //       item?.apellido_materno +
    //       " " +
    //       item?.nombre,
    //     celular: item?.telefono,
    //     cargo: item?.contratos?.at(-1)?.puesto,
    //     contrato_id: item.contratos?.at(-1).id,
    //     pago: item?.contratos
    //       ?.at(-1)
    //       ?.contrato_pagos?.map((data) => {
    //         return {
    //           id: data?.pago?.id,
    //           teletrans: data?.pago?.teletrans,
    //           observacion: data?.pago?.observacion,
    //           fecha_pago: data?.pago?.fecha_pago,
    //           tipo: data?.pago?.tipo,
    //         };
    //       })
    //       .sort((a, b) => a.id - b.id)
    //       .at(-1),
    //   };
    // });

    const format = filterIncentivo
      .map((item) => {
        return {
          pago_id: item?.id,
          observacion: item?.observacion,
          fecha_pago: item?.fecha_pago,
          tipo: item?.tipo,
          estado: item?.estado,
          trabajadores: item?.contrato_pagos?.map((data) => {
            return {
              contrato_id: data?.contrato_id,
              teletrans: data?.teletrans,
              nombre:
                data?.contrato?.trabajador_contratos.at(-1)?.trabajador?.nombre +
                " " +
                data?.contrato?.trabajador_contratos.at(-1)?.trabajador?.apellido_paterno +
                " " +
                data?.contrato?.trabajador_contratos.at(-1)?.trabajador?.apellido_materno,
              cargo: data?.contrato?.puesto,
              celular: data?.contrato?.trabajador?.telefono,
            };
          }),
        };
      })
      ?.filter((item) => item?.estado === "programado");

    return res.status(200).json({ data: format });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

//mostrar trabajadores para registrar incentivo
const getTrabajadoresIncentivo = async (req, res, next) => {
  try {
    const get = await trabajador.findAll({
      where: {
        [Op.and]: [{ deshabilitado: { [Op.not]: true } }],
      },
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: trabajador_contrato,
          include: [
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },
              where: {
                [Op.and]: [{ finalizado: { [Op.not]: true } }],
              },
            },
          ],
        },
      ],
    });

    const formatData = get.map((item) => {
      return {
        nombre:
          item?.apellido_paterno +
          " " +
          item?.apellido_materno +
          " " +
          item?.nombre,
        celular: item?.telefono,
        cargo: item?.contratos?.at(-1)?.puesto,
        contrato_id: item.contratos?.at(-1).id,
        // pago_id: item?.contratos?.at(-1)?.contrato_pagos?.at(-1).pago_id,
        // pago: item?.contratos
        //   ?.at(-1)
        //   ?.contrato_pagos?.map((data) => {
        //     return {
        //       id: data?.pago?.id,
        //       teletrans: data?.pago?.teletrans,
        //       observacion: data?.pago?.observacion,
        //       fecha_pago: data?.pago?.fecha_pago,
        //       tipo: data?.pago?.tipo,
        //     };
        //   })
        //   .sort((a, b) => a.id - b.id)
        //   .at(-1),
      };
    });

    return res.status(200).json({ data: formatData });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getIncentivoById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const camp = await campamento.findAll({ where: { id: id } });
    return res.status(200).json({ data: camp });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postIncentivo = async (req, res, next) => {
  let createPago;
  let updatePago;
  if (req.body.id) {
    updatePago = {
      id: req.body.id,
      observacion: req.body.observacion,
      fecha_pago: req.body.fecha_pago,
      estado: "programado",
      teletrans: req.body.teletrans,
      tipo: req.body.tipo,
    };
  } else {
    createPago = {
      observacion: req.body.observacion,
      fecha_pago: req.body.fecha_pago,
      estado: "programado",
      teletrans: req.body.teletrans,
      tipo: req.body.tipo,
    };
  }

  try {
    if (req.body.contrato_id === undefined && req.body.contrato_id === "") {
      return res.status(400).json({
        msg: "Error! Datos incompletos.",
        status: 400,
      });
    }
    if (parseInt(req.body.teletrans) % 4 !== 0) {
      return res.status(400).json({
        msg: "Error! La cantidad de teletrans debe ser igual a 1 ó mas volquetes.",
        status: 400,
      });
    } else {
      if (createPago) {
        const post = await pago.create(createPago);
        let contra_pago = {
          pago_id: post.id,
          contrato_id: req.body.contrato_id,
          teletrans: req.body.teletrans,
        };
        const pagoContrato = await contrato_pago.create(contra_pago);
      } else {
        const post = await pago.update(updatePago, {
          where: { id: req.body.id },
        });
      }
      return res
        .status(200)
        .json({ msg: "Incentivo registrado con éxito!", status: 200 });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo crear.", status: 500 });
  }
};

const postIncentivoMultiple = async (req, res, next) => {
  let pruebaPago = {
    observacion: "observacion",
    fecha_pago: "2023-02-02",
    estado: false,
    tipo: "incentivo",
    trabajadores: [
      {
        teletrans: 1,
        contrato_id: 10,
      },
      {
        teletrans: 0.5,
        contrato_id: 11,
      },
      {
        teletrans: 1.5,
        contrato_id: 12,
      },
      {
        teletrans: 1,
        contrato_id: 13,
      },
    ],
  };
  const info = {
    observacion: pruebaPago.observacion,
    fecha_pago: pruebaPago.fecha_pago,
    tipo: pruebaPago.tipo,
    estado: false,
  };

  try {
    const totalTeletrans = pruebaPago.trabajadores.reduce(
      (acc, value) => acc + parseFloat(value.teletrans),
      0
    );

    if (totalTeletrans === 4) {
      const post = await pago.create(createPago);
      let contra_pago = pruebaPago.trabajadores.map((item) => {
        return {
          teletrans: item.teletrans,
          contrato_id: item.contrato_id,
          pago_id: post.id,
        };
      });
      const pagoContrato = await contrato_pago.create(contra_pago);
      return res
        .status(200)
        .json({ msg: "Incentivo registrado con éxito!", status: 200 });
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

const deleteIncentivo = async (req, res, next) => {
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
      .json({ msg: "Incentivo eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

module.exports = {
  postIncentivo,
  getIncentivo,
  getIncentivoById,
  deleteIncentivo,
  postIncentivoMultiple,
  getTrabajadoresIncentivo,
};
