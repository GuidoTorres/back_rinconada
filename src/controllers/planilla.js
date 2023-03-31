const {
  trabajador,
  asociacion,
  contrato,
  evaluacion,
  campamento,
  teletrans,
  asistencia,
  trabajadorAsistencia,
  pago,
  contrato_pago,
  pago_asociacion,
  trabajador_contrato,
} = require("../../config/db");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

const getPlanilla = async (req, res, next) => {
  try {
    const traba = await trabajador.findAll({
      where: {
        [Op.and]: [
          { asociacion_id: { [Op.is]: null } },
          { deshabilitado: { [Op.not]: true } },
        ],
      },
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
        },
        { model: evaluacion },
        {
          model: trabajador_contrato,
          attributes: { exclude: ["contrato_id"] },

          include: [
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },
              where: {
                [Op.and]: [{ finalizado: { [Op.not]: true } }],
              },
              include: [
                { model: teletrans },
                { model: campamento, include: [{ model: asistencia }] },
              ],
            },
          ],
        },
      ],
    });

    const asoci = await asociacion.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [
            { model: teletrans },
            { model: campamento, include: [{ model: asistencia }] },
          ],
        },
      ],
    });

    const filterAsociacion = asoci?.filter(
      (item) => item?.contratos?.length !== 0
    );
    const filterTrabajador = traba?.filter(
      (item) => item?.contratos?.length !== 0
    );
    const mapAsociacion = filterAsociacion.map((item, i) => {
      return {
        id: item?.id,
        nombre: item?.nombre,
        codigo: item?.codigo,
        fecha_inicio: item?.contratos?.at(-1)?.fecha_inicio,
        fecha_fin: item?.contratos?.at(-1)?.fecha_fin,
        contratos: item?.contratos.at(-1),
        volquete: item?.contratos?.at(-1)?.volquete,
        puesto: "",
        campamento: item.contratos
          .map((item) => item.campamento.nombre)
          .toString(),
        teletran: parseInt(item?.contratos.at(-1)?.teletrans.at(-1)?.teletrans),
        total: parseInt(item?.contratos.at(-1)?.teletrans.at(-1)?.total),
        saldo: parseInt(item?.contratos.at(-1)?.teletrans.at(-1)?.saldo),
      };
    });

    const mapTrabajador = filterTrabajador.map((item) => {
      return {
        dni: item?.dni,
        codigo_trabajador: item?.codigo_trabajador,
        fecha_nacimiento: item?.fecha_nacimiento,
        telefono: item?.telefono,
        nombre:
          item?.nombre +
          " " +
          item?.apellido_paterno +
          " " +
          item?.apellido_materno,
        email: item?.email,
        // campamento: item?.contratos
        //   ?.map((item) => item?.campamento?.nombre)
        //   ?.toString(),
        estado_civil: item?.estado_civil,
        genero: item?.genero,
        direccion: item?.direccion,
        asociacion_id: item?.asociacion_id,
        deshabilitado: item?.deshabilitado,
        eliminar: item?.e,
        // contratos: item?.contratos?.at(-1),
        // puesto: item?.contratos?.at(-1)?.puesto,
        // fecha_inicio: item?.contratos?.at(-1)?.fecha_inicio,
        // fecha_fin: String(
        //   item?.contratos?.map((acc, curr) => {
        //     const trabajador_asistencia = item?.trabajador_asistencia?.filter(
        //       (data) => data?.asistencia !== "Asistio"
        //     ).length;

        //     return dayjs(acc.fecha_fin)
        //       .add(trabajador_asistencia, "day")
        //       .toISOString();
        //   })
        // ),
        asistencia: item.trabajador_asistencia.filter(
          (data) => data.asistencia === "Asistio"
        ).length,
        evaluacion: item.evaluacions,
        // volquete: item?.contratos?.at(-1)?.volquete,
        // teletran: parseInt(item?.contratos.at(-1)?.teletrans.at(-1)?.teletrans),
        // total: parseInt(item?.contratos.at(-1)?.teletrans.at(-1)?.total),
        // saldo: parseInt(item?.contratos.at(-1)?.teletrans.at(-1)?.saldo),
      };
    });

    const final = mapAsociacion.concat(mapTrabajador);

    return res.status(200).json({ data: final });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

//lista de asociaciones con trabajadores para programar
const getListaPago = async (req, res, next) => {
  try {
    const getPlanilla = await trabajador.findAll({
      where: {
        [Op.and]: [
          { asociacion_id: { [Op.is]: null } },
          { deshabilitado: { [Op.not]: true } },
        ],
      },
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
          include: [{ model: asistencia }],
        },
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          where: {
            [Op.and]: [{ finalizado: { [Op.not]: true } }],
          },
          include: [
            { model: teletrans },
            {
              model: contrato_pago,
              attributes: { exclude: ["contrato_pago_id"] },
              include: [{ model: pago }],
            },
          ],
        },
      ],
    });

    const getAsociacion = await asociacion.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          // where: {
          //   [Op.and]: [{ finalizado: { [Op.not]: true } }],
          // },
          include: [
            { model: teletrans },
            {
              model: contrato_pago,
              attributes: { exclude: ["contrato_pago_id"] },
              include: [{ model: pago }],
            },
          ],
        },
        {
          model: trabajador,
          attributes: { exclude: ["usuarioId"] },
          include: [{ model: evaluacion }, { model: pago_asociacion }],
        },
      ],
    });

    const fecha = new Date();
    const formatAsociacion = getAsociacion
      .map((item) => {
        let contratoActivo = item?.contratos?.filter(
          (item) => item?.finalizado === false
        );
        const fechaActual = dayjs(fecha);
        const fechaContrato = dayjs(contratoActivo?.at(-1)?.fecha_inicio);
        const diferencia = fechaActual.diff(fechaContrato, "day");

        return {
          dni: "---",
          nombre: item?.nombre,
          contrato_id: item?.contratos?.at(-1)?.id,
          dias_cumplidos: diferencia,
          trabajadores: item?.trabajadors?.map((data) => {
            return {
              dni: data?.dni,
              nombre:
                data?.nombre +
                " " +
                data?.apellido_paterno +
                " " +
                data?.apellido_materno,
              evaluacion_id: data?.evaluacions
                ?.filter((dat) => dat.finalizado === false)
                ?.at(-1)?.id,
              programado: data.pago_asociacions.length > 0 ? true : false,
            };
          }),
        };
      })
      .filter((item) => item.dias_cumplidos >= 14);

    // const filterAsistencia = getPlanilla
    //   ?.map((item, i) => {
    //     let contratoActivo = item?.contratos?.filter(
    //       (item) => item?.finalizado === false
    //     );
    //     return {
    //       dni: item?.dni,
    //       codigo_trabajador: item?.codigo_trabajador,
    //       fecha_nacimiento: item?.fecha_nacimiento,
    //       telefono: item?.telefono,
    //       tipo: "---",
    //       nombre:
    //         item?.nombre +
    //         " " +
    //         item?.apellido_paterno +
    //         " " +
    //         item?.apellido_materno,
    //       trabajador_asistencia: item?.trabajador_asistencia,
    //       contrato: item?.contratos,
    //       asistencias: item?.trabajador_asistencia?.filter(
    //         (data) => data.asistencia === "Asistio"
    //       ).length,
    //       nro_quincena:
    //         parseInt(
    //           item?.trabajador_asistencia?.filter(
    //             (data) => data.asistencia === "Asistio"
    //           ).length
    //         ) / 15,
    //       volquetes: contratoActivo?.at(-1)?.teletrans?.at(-1)?.volquete,
    //       teletrans: contratoActivo?.at(-1)?.teletrans?.at(-1)?.teletrans,
    //       total: contratoActivo?.at(-1)?.teletrans?.at(-1)?.total,
    //       saldo: contratoActivo?.at(-1)?.teletrans?.at(-1)?.saldo,
    //       contrato_id: contratoActivo?.at(-1).id,
    //     };
    //   })
    //   .filter((item) => item.asistencias !== 0 && item.asistencias % 15 >= 0)
    //   .flat();

    // const duplicate = filterAsistencia
    //   .map((item) =>
    //     item?.trabajador_asistencia
    //       ?.slice(0, item.nro_quincena)
    //       .map((data, i) => {
    //         return {
    //           dni: item.dni,
    //           nombre: item?.nombre,
    //           cargo: item?.contrato?.at(-1)?.puesto,
    //           asistencias: item?.trabajador_asistencia?.filter(
    //             (data) => data.asistencia === "Asistio"
    //           ).length,
    //           nro_quincena: i + 1,
    //           contrato_id: item.contrato_id,
    //         };
    //       })
    //   )
    //   .flat();

    // let concat = duplicate.concat(formatAsociacion);
    return res.status(200).json({ data: formatAsociacion });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

//lista de asociaciones con trabajadores para programar
const getListaAsociacionProgramada = async (req, res, next) => {
  try {
    const getAsociacion = await pago.findAll({
      where: { tipo: "asociacion" },
      include: [
        {
          model: contrato_pago,
          attributes: { exclude: ["contrato_pago_id"] },
          include: [
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },
              include: [{ model: asociacion }],
            },

            {
              model: pago_asociacion,
              include: [
                { model: trabajador, attributes: { exclude: ["usuarioId"] } },
              ],
            },
          ],
        },
      ],
    });

    const formatData = getAsociacion
      .map((item) => {
        return {
          id: item?.id,
          teletrans: item?.teletrans,
          observacion: item?.observacion,
          fecha_pago: item?.fecha_pago,
          estado: item?.estado,
          tipo: item?.tipo,
          volquetes: item?.volquetes,
          asociacion: item?.contrato_pagos.at(-1)?.contrato?.asociacion?.nombre,
          tipo_asociacion:
            item?.contrato_pagos.at(-1)?.contrato?.asociacion?.tipo,
          contrato_id: item?.contrato_pagos.at(-1)?.contrato?.id,
          trabajadores: item?.contrato_pagos
            ?.map((data) =>
              data?.pago_asociacions?.map((dat) => {
                return {
                  id: dat?.id,
                  teletrans: dat?.teletrans,
                  dni: dat?.trabajador_dni,
                  nombre:
                    dat?.trabajador?.nombre +
                    " " +
                    dat?.trabajador?.apellido_paterno +
                    " " +
                    dat?.trabajador?.apellido_materno,
                };
              })
            )
            .flat(),
        };
      })
      .filter(
        (item) => item?.estado === "programado" && item.trabajadores.length > 0
      );

    return res.status(200).json({ data: formatData });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getPlanillaPago = async (req, res, next) => {
  try {
    const getPlanilla = await trabajador.findAll({
      where: {
        [Op.and]: [
          { asociacion_id: { [Op.is]: null } },
          { deshabilitado: { [Op.not]: true } },
        ],
      },
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
          include: [{ model: asistencia }],
        },
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          where: {
            [Op.and]: [{ finalizado: { [Op.not]: true } }],
          },
          include: [
            { model: teletrans },
            {
              model: contrato_pago,
              attributes: { exclude: ["contrato_pago_id"] },
              include: [{ model: pago }],
            },
          ],
        },
      ],
    });

    const getAsociacion = await asociacion.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          // where: {
          //   [Op.and]: [{ finalizado: { [Op.not]: true } }],
          // },
          include: [
            { model: teletrans },
            {
              model: contrato_pago,
              attributes: { exclude: ["contrato_pago_id"] },
              include: [{ model: pago }],
            },
          ],
        },
        {
          model: trabajador,
          attributes: { exclude: ["usuarioId"] },
          include: [{ model: evaluacion }],
        },
      ],
    });

    const fecha = new Date();
    const formatAsociacion = getAsociacion
      .map((item) => {
        let contratoActivo = item?.contratos?.filter(
          (item) => item?.finalizado === false
        );
        const fechaActual = dayjs(fecha);
        const fechaContrato = dayjs(contratoActivo?.at(-1)?.fecha_inicio);
        const diferencia = fechaActual.diff(fechaContrato, "day");

        return {
          dni: item?.dni,
          codigo_trabajador: "---",
          fecha_nacimiento: "---",
          telefono: "---",
          tipo: item.tipo,
          nombre: item?.nombre,
          trabajador_asistencia: "---",
          asistencias: "---",
          nro_quincena: "---",
          volquetes: contratoActivo?.at(-1)?.teletrans?.at(-1)?.volquete,
          teletrans: contratoActivo?.at(-1)?.teletrans?.at(-1)?.teletrans,
          total: contratoActivo?.at(-1)?.teletrans?.at(-1)?.total,
          saldo: contratoActivo?.at(-1)?.teletrans?.at(-1)?.saldo,
          fecha_inicio: fechaContrato,
          dias_cumplidos: diferencia,
          contrato: item?.contratos.at(-1),
          trabajadores: item?.trabajadors?.map((data) => {
            return {
              dni: data?.dni,
              nombre:
                data?.nombre +
                " " +
                data?.apellido_paterno +
                " " +
                data?.apellido_materno,
              codigo_trabajador: data?.codigo_trabajador,
              celular: data?.celular,
              evaluacion_id: data?.evaluacions
                ?.map((dat) => dat?.id)
                .toString(),
              asociacion_id: data?.asociacion_id,
            };
          }),
        };
      })
      .filter((item) => item.dias_cumplidos >= 14);

    const filterAsistencia = getPlanilla
      ?.map((item, i) => {
        let contratoActivo = item?.contratos?.filter(
          (item) => item?.finalizado === false
        );
        return {
          dni: item?.dni,
          codigo_trabajador: item?.codigo_trabajador,
          fecha_nacimiento: item?.fecha_nacimiento,
          telefono: item?.telefono,
          tipo: "---",
          nombre:
            item?.nombre +
            " " +
            item?.apellido_paterno +
            " " +
            item?.apellido_materno,
          trabajador_asistencia: item?.trabajador_asistencia,
          contrato: item?.contratos,
          asistencias: item?.trabajador_asistencia?.filter(
            (data) => data.asistencia === "Asistio"
          ).length,
          nro_quincena:
            parseInt(
              item?.trabajador_asistencia?.filter(
                (data) => data.asistencia === "Asistio"
              ).length
            ) / 15,
          volquetes: contratoActivo?.at(-1)?.teletrans?.at(-1)?.volquete,
          teletrans: contratoActivo?.at(-1)?.teletrans?.at(-1)?.teletrans,
          total: contratoActivo?.at(-1)?.teletrans?.at(-1)?.total,
          saldo: contratoActivo?.at(-1)?.teletrans?.at(-1)?.saldo,
        };
      })
      .filter((item) => item.asistencias !== 0 && item.asistencias % 15 >= 0)
      .flat();

    const duplicate = filterAsistencia
      .map((item) =>
        item?.trabajador_asistencia
          ?.slice(0, item.nro_quincena)
          .map((data, i) => {
            return {
              dni: item.dni,
              codigo_trabajador: item?.codigo_trabajador,
              fecha_nacimiento: item?.fecha_nacimiento,
              telefono: item?.telefono,
              nombre: item?.nombre,
              cargo: item?.contrato?.at(-1)?.puesto,
              asistencias: item?.trabajador_asistencia?.filter(
                (data) => data.asistencia === "Asistio"
              ).length,
              nro_quincena: i + 1,
              fecha_inicio: item?.trabajador_asistencia?.at((i + 1 - 1) * 15)
                ?.asistencium?.fecha,
              fecha_fin: item?.trabajador_asistencia?.at((i + 1 - 1) * 15 + 14)
                ?.asistencium?.fecha,
              contrato: item?.contrato.at(-1),
              volquetes: item.volquetes,
              teletrans: item.teletrans,
              total: item.total,
              saldo: item.saldo,
              // observacion: item?.contrato
              //   .at(-1)
              //   .pagos.map((item) => item.observacion)
              //   .toString(),
              // teletrans: item?.contrato
              //   .at(-1)
              //   .pagos.map((item) => item.teletrans)
              //   .toString(),
              // fecha_pago: item?.contrato
              //   .at(-1)
              //   .pagos.map((item) => item.fecha_pago)
              //   .toString(),
              // contrato_id: item?.contrato.at(-1)?.id,
              // pago_id: item?.contrato
              //   .at(-1)
              //   .pagos.map((item) => item.id)
              //   .toString(),
              // pagos: item?.contrato?.at(-1)?.pagos
            };
          })
      )
      .flat();

    let concat = duplicate
      .concat(formatAsociacion)
      .filter((item) => item?.contrato?.contrato_pagos?.length > 0);
    return res.status(200).json({ data: concat });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const campamentoPlanilla = async (req, res, next) => {
  try {
    const trabajadoresCapamento = await campamento.findAll({});

    return res.status(200).json({ data: trabajadoresCapamento });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getTareoTrabajador = async (req, res, next) => {
  id = req.params.id;

  try {
    const getTareo = await trabajador.findAll({
      where: { dni: id },
      attributes: {
        exclude: ["usuarioId"],
      },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
          where: { trabajador_id: id },
          include: [{ model: asistencia }],
        },
      ],
    });

    const obj = getTareo.map((item) => item.trabajador_asistencia).flat();

    return res.status(200).json({ data: obj });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getTareoAsociacion = async (req, res, next) => {
  id = req.params.id;
  try {
    const getAsociacionTareo = await trabajador.findAll({
      where: { asociacion_id: id },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
          include: [{ model: asistencia }],
        },
      ],
    });

    const getContrato = await asociacion.findAll({
      where: { id: id },
      include: [
        {
          model: contrato,
          attributes: {
            exclude: ["contrato_id"],
          },
        },
      ],
    });

    const fecha_inicio = getContrato
      .map((item) => item.contratos[item.contratos.length - 1].fecha_inicio)
      .flat()
      .toLocaleString("sv-SE", {
        timeZone: "UTC",
      });

    const fecha_fin = getContrato
      .map((item) => item.contratos[item.contratos.length - 1].fecha_fin)
      .flat()
      .toLocaleString("sv-SE", {
        timeZone: "UTC",
      });

    let fechas = [];

    const formatFechas = getAsociacionTareo.map((item) => {
      return {
        fecha: item.trabajador_asistencia.map((data) =>
          fechas.push(data.asistencium.fecha)
        ),
      };
    });

    const fecha_final = [...new Set(fechas)];
    const fecha1 = {
      fecha: fecha_final,
    };
    const finalJson = getAsociacionTareo.map((item) => {
      return {
        dni: item.dni,
        codigo_trabajador: item.codigo_trabajador,
        fecha_nacimiento: item.fecha_nacimiento,
        telefono: item.telefono,
        apellido_materno: item.apellido_materno,
        apellido_paterno: item.apellido_paterno,
        nombre: item.nombre,
        email: item.email,
        trabajador_asistencia: item.trabajador_asistencia,
      };
    });

    const concat = finalJson.concat(fecha1);
    return res.status(200).json({ data: concat });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const juntarTeletrans = async (req, res, next) => {
  try {
    const getTrabajador = await trabajador.findAll({
      where: { asociacion_id: { [Op.is]: null } },
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
        },
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          where: {
            [Op.and]: [{ finalizado: { [Op.not]: true } }],
          },
          include: [{ model: teletrans }],
        },
      ],
    });

    const filterAsistencia = getTrabajador
      ?.map((item, i) => {
        return {
          id: i + 1,
          dni: item?.dni,
          codigo_trabajador: item?.codigo_trabajador,
          fecha_nacimiento: item?.fecha_nacimiento,
          telefono: item?.telefono,
          nombre:
            item?.nombre +
            " " +
            item?.apellido_paterno +
            " " +
            item?.apellido_materno,
          saldo: item.contratos.at(-1).teletrans.at(-1).saldo,
          trabajador_asistencia: item?.trabajador_asistencia,
          contrato: item?.contratos,
          asistencias: item?.trabajador_asistencia?.filter(
            (data) => data.asistencia === "Asistio"
          ).length,
          nro_quincena:
            parseInt(
              item?.trabajador_asistencia?.filter(
                (data) => data.asistencia === "Asistio"
              ).length
            ) / 15,
        };
      })
      .filter(
        (item) =>
          item.asistencias !== 0 &&
          item.asistencias % 15 === 0 &&
          parseInt(item.saldo) % 4 !== 0
      )
      .flat();

    const filter = filterAsistencia
      .map((item) => {
        return {
          nombre: item?.nombre,
          telefono: item?.telefono,
          dni: item?.dni,
          volquete: parseInt(
            item?.contrato?.at(-1)?.teletrans?.at(-1)?.volquete
          ),
          teletrans: parseInt(
            item?.contrato?.at(-1)?.teletrans?.at(-1)?.teletrans
          ),
          saldo: parseInt(item?.saldo),
          dias_laborados: item?.trabajador_asistencia.filter(
            (data) => data?.asistencia === "Asistio"
          ).length,
          contrato_id: item?.contrato?.at(-1).id,
          contrato: item?.contrato,
        };
      })
      .flat();

    return res.status(200).json({ data: filter });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const updateFechaPago = async (req, res, next) => {
  id = req.params.id;

  try {
    const get = await fecha_pago.update({ where: { contrato_id: id } });

    res.status(500).json({ msg: "Actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const updatepagoAsociacion = async (req, res, next) => {
  let pago_id = req.params.id;
  const totalTeletrans = req?.body?.trabajadores?.reduce(
    (acc, value) => acc + parseFloat(value.teletrans),
    0
  );
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    contrato_id: req.body.contrato_id,
    volquetes: req.body.volquetes,
    teletrans: req.body.teletrans,
  };
  try {
    if (!req.body.trabajadores) {
      let update = await pago.update(info, {
        where: { id: pago_id },
      });
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

      const getContratoPago = await contrato_pago.findAll({
        where: { pago_id: pago_id },
        attributes: { exclude: ["contrato_pago_id"] },
      });
      const contratoPagoId = getContratoPago?.at(-1)?.id;
      console.log(contratoPagoId);
      const destoryPagoAsociacion = await pago_asociacion.destroy({
        where: { contrato_pago_id: contratoPagoId },
      });
      const delPagoContrato = await contrato_pago.destroy({
        where: { pago_id: pago_id },
      });

      let contra_pago = {
        pago_id: pago_id,
        contrato_id: req.body.contrato_id,
        volquetes: req?.body.volquetes,
        teletrans: req?.body.teletrans,
      };
      const pagoContrato = await contrato_pago.create(contra_pago);

      let asociacionPago = req.body.trabajadores.map((item) => {
        return {
          teletrans: item.teletrans,
          trabajador_dni: item.trabajador_dni,
          contrato_pago_id: pagoContrato.id,
        };
      });
      console.log(asociacionPago);

      const asociPago = await pago_asociacion.bulkCreate(asociacionPago, {
        ignoreDuplicates: false,
      });

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

module.exports = {
  getPlanilla,
  campamentoPlanilla,
  getTareoTrabajador,
  getTareoAsociacion,
  juntarTeletrans,
  getPlanillaPago,
  getListaPago,
  getListaAsociacionProgramada,
  updatepagoAsociacion,
};
