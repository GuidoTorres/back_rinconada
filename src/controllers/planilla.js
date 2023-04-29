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
  aprobacion_contrato_pago,
  area,
  cargo,
  gerencia,
} = require("../../config/db");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

//lista de trabajadores y planillas para la vista de planillas
const getPlanilla = async (req, res, next) => {
  try {
    const gettraba = trabajador.findAll({
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
        { model: evaluacion },
        {
          model: trabajador_contrato,
          attributes: { exclude: ["contrato_id"] },

          include: [
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },
              where: {
                finalizado: { [Op.not]: true },
              },
              include: [
                { model: teletrans },
                {
                  model: campamento,
                  attributes: { exclude: ["campamento_id"] },
                  include: [{ model: asistencia }],
                },
                { model: gerencia },
                { model: area, attributes: { exclude: ["area_id"] } },
                {
                  model: cargo,
                  attributes: { exclude: ["puesto_id", "cargo_id"] },
                },
              ],
            },
          ],
        },
      ],
    });

    const getasoci = asociacion.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [
            { model: teletrans },
            {
              model: campamento,
              attributes: { exclude: ["campamento_id"] },
              include: [{ model: asistencia }],
            },
          ],
        },
        {
          model: trabajador,
          attributes: {
            exclude: [
              "trabajadorId",
              "asistenciumId",
              "trabajadorDni",
              "usuarioId",
            ],
          },
          include: [
            {
              model: trabajadorAsistencia,
              attributes: {
                exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
              },
              include: [{ model: asistencia }],
            },
          ],
        },
      ],
    });

    const [traba, asoci] = await Promise.all([gettraba, getasoci]);

    const filterAsociacion = asoci?.filter(
      (item) => item?.contratos?.length > 0
    );
    const filterTrabajador = traba?.filter(
      (item) => item?.trabajador_contratos?.length > 0
    );
    const mapAsociacion =
      filterAsociacion.length > 0 &&
      filterAsociacion
        ?.map((item, i) => {
          const trabajadorCodigoMenor = item?.trabajadors?.length
            ? item?.trabajadors?.reduce((prev, curr) => {
                return prev.codigo_trabajador < curr.codigo_trabajador
                  ? prev
                  : curr;
              })
            : null;
          return {
            nombre: item?.nombre,
            asociacion_id: item?.id,
            codigo: item?.codigo,
            fecha_inicio: dayjs(
              item?.contratos
                ?.filter((data) => data.finalizado === false)
                ?.at(-1)?.fecha_inicio
            ).format("DD-MM-YYYY"),
            fecha_fin: dayjs(
              item?.contratos
                ?.filter((data) => data.finalizado === false)
                ?.at(-1)?.fecha_fin
            ).format("DD-MM-YYYY"),
            contratos: item?.contratos
              .filter((data) => data.finalizado === false)
              .at(-1),
            volquete: item?.contratos
              .filter((data) => data.finalizado === false)
              .at(-1)
              ?.teletrans.at(-1)?.volquete,
            puesto: "",
            campamento: item.contratos
              .map((item) => item.campamento.nombre)
              .toString(),
            teletran: item?.contratos
              .filter((data) => data.finalizado === false)
              .at(-1)
              ?.teletrans.at(-1)?.teletrans,
            total: item?.contratos
              .filter((data) => data.finalizado === false)
              .at(-1)
              ?.teletrans.at(-1)?.total,
            saldo: item?.contratos
              .filter((data) => data.finalizado === false)
              .at(-1)
              ?.teletrans.at(-1)?.saldo,
            asistencia: trabajadorCodigoMenor?.trabajador_asistencia?.filter(
              (data) => data?.asistencia === "Asistio"
            ).length,
          };
        })
        .filter((item) => item.contratos);

    const mapTrabajador = filterTrabajador?.map((item, i) => {
      const contratoFiltrado = item?.trabajador_contratos?.filter(
        (data) => data.contrato.finalizado === false
      );
      return {
        dni: item?.dni,
        codigo_trabajador: item?.codigo_trabajador,
        fecha_nacimiento: item?.fecha_nacimiento,
        telefono: item?.telefono,
        nombre:
          item?.apellido_paterno +
          " " +
          item?.apellido_materno +
          " " +
          item?.nombre,
        email: item?.email,
        estado_civil: item?.estado_civil,
        genero: item?.genero,
        direccion: item?.direccion,
        asociacion_id: item?.asociacion_id,
        deshabilitado: item?.deshabilitado,
        contratos: contratoFiltrado,
        gerencia: contratoFiltrado?.at(0)?.contrato?.gerencia?.nombre,
        area: contratoFiltrado?.at(0)?.contrato?.area.nombre,
        puesto: contratoFiltrado?.at(0)?.contrato?.cargo?.nombre,
        fecha_inicio: dayjs(
          contratoFiltrado?.map((dat) => dat?.contrato?.fecha_inicio)
        ).format("DD-MM-YYYY"),
        fecha_fin: dayjs(
          contratoFiltrado?.map((dat) => dat?.contrato?.fecha_fin)
        ).format("DD-MM-YYYY"),
        fecha_fin_estimada: dayjs(
          contratoFiltrado?.map((dat) => dat?.contrato?.fecha_fin_estimada)
        ).format("DD-MM-YYYY"),
        campamento: contratoFiltrado
          ?.map((dat) => dat?.contrato?.campamento?.nombre)
          .toString(),
        trabajador_asistencia: item?.trabajador_asistencia,
        asistencia: item?.trabajador_asistencia?.filter(
          (data) => data.asistencia === "Asistio"
        ).length,
        evaluacion: item?.evaluacions,
        volquete:
          contratoFiltrado
            ?.map((dat) => dat?.contrato?.teletrans?.at(-1)?.volquete)
            .toString() || 0,
        teletran:
          contratoFiltrado
            ?.map((dat) => dat?.contrato?.teletrans?.at(-1)?.teletrans)
            .toString() || 0,
        total:
          contratoFiltrado
            ?.map((dat) => dat?.contrato?.teletrans?.at(-1)?.total)
            .toString() || 0,
        saldo:
          contratoFiltrado
            ?.map((dat) => dat?.contrato?.teletrans?.at(-1)?.saldo)
            .toString() || 0,
      };
    });

    const final = mapAsociacion.concat(mapTrabajador);
    const finalConId = final.map((elemento, indice) => {
      return {
        id: indice + 1,
        ...elemento,
      };
    });

    return res.status(200).json({ data: finalConId });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getPlanillaHistoriaTrabajador = async (req, res, next) => {
  let id = req.params.id;
  try {
    const traba = await trabajador.findOne({
      where: {
        dni: id,
        asociacion_id: { [Op.is]: null },
        deshabilitado: { [Op.not]: true },
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
          model: trabajador_contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },
              where: { finalizado: { [Op.not]: true } },
              include: [{ model: teletrans }],
            },
          ],
        },
      ],
    });

    // Filtramos las asistencias para solo obtener las que tienen asistencia: "Asistio"
    const asistencias = traba?.trabajador_asistencia?.filter(
      (asistencia) => asistencia.asistencia === "Asistio"
    );

    // Separamos las asistencias en sub-arrays de máximo 15 elementos
    const asistenciasDivididas = [];
    let asistenciasValidas = 0;
    let asistenciasActuales = [];

    for (let i = 0; i < asistencias?.length; i++) {
      if (asistencias[i].asistencia === "Asistio") {
        asistenciasValidas++;
        asistenciasActuales.push(asistencias[i]);
      }

      if (asistenciasValidas === 15 || i === asistencias.length - 1) {
        asistenciasDivididas.push(asistenciasActuales);
        asistenciasValidas = 0;
        asistenciasActuales = [];
      }
    }

    // Construimos los objetos finales por cada bloque de 15 asistencias
    const trabaFinal = asistenciasDivididas.map((asistenciasBloque) => {
      const trabajadorData = { ...traba.dataValues };
      delete trabajadorData.trabajador_asistencias;

      return {
        ...trabajadorData,
        trabajador_asistencias: asistenciasBloque.sort(
          (a, b) =>
            new Date(a.asistencium.fecha) - new Date(b.asistencium.fecha)
        ),
      };
    });

    return res.status(200).json({ data: trabaFinal });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

//lista de asociaciones con trabajadores para programar
const getListaPago = async (req, res, next) => {
  try {
    const getAsociacion = await asociacion.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          // where: {
          //   finalizado: false,
          // },
          include: [
            { model: teletrans },
            {
              model: contrato_pago,
              attributes: { exclude: ["contrato_pago_id"] },
              include: [
                { model: pago },
                {
                  model: pago_asociacion,
                  include: [
                    {
                      model: trabajador,
                      attributes: { exclude: ["usuarioId"] },
                    },
                  ],
                },
              ],
            },
            {
              model: trabajador_contrato,
              include: [
                { model: trabajador, attributes: { exclude: ["usuarioId"] } },
              ],
            },
            { model: aprobacion_contrato_pago },
          ],
        },
      ],
    });

    const formatAsociacion = getAsociacion
      .flatMap((item, i) => {
        // Filtrar aprobaciones con estado true y pagado false
        const aprobacionesFiltradas = item?.contratos
          .at(-1)
          ?.aprobacion_contrato_pagos.filter(
            (aprobacion) =>
              aprobacion.estado === true && aprobacion.pagado === null
          );

        // Mapear cada aprobación a un nuevo objeto
        return aprobacionesFiltradas?.map((aprobacion) => {
          const trabajadores = item?.contratos
            .at(-1)
            ?.trabajador_contratos.map((item) => {
              return {
                ...item.trabajador,
              };
            });

          const trabajadoresProgramados = item?.contratos
            .at(-1)
            ?.contrato_pagos?.map((data) =>
              data.pago_asociacions.map((item) => {
                return { dni: item.trabajador_dni, teletrans: item.teletrans };
              })
            )
            .flat();
          const pagos = {
            trabajadores: trabajadores.map((trabajador, i) => {
              const trabajadorProgramado = trabajadoresProgramados.find(
                (item) => item.dni === trabajador.dataValues.dni
              );

              return {
                id: i + 1,
                teletrans: trabajadorProgramado
                  ? trabajadorProgramado.teletrans
                  : 0,
                dni: trabajador.dataValues.dni,
                nombre:
                  trabajador.dataValues.apellido_paterno +
                  " " +
                  trabajador.dataValues.apellido_materno +
                  " " +
                  trabajador.dataValues.nombre,
                telefono: trabajador.dataValues.telefono,
                cargo: item.tipo,
                programado: trabajadorProgramado ? true : false,
                contrato_id: item?.contratos?.at(-1)?.id,
              };
            }),
          };
          const totalMenosTtrans = trabajadoresProgramados.reduce(
            (acumulador, objeto) =>
              parseFloat(acumulador) + parseFloat(objeto.teletrans),
            0
          );
          return {
            dni: "---",
            nombre: item?.nombre,
            tipo: item.tipo,
            contrato_id: item?.contratos?.at(-1)?.id,
            aprobacion: aprobacion,
            total_modificado:
              parseFloat(item?.contratos?.at(-1)?.teletrans?.at(-1)?.total) -
              totalMenosTtrans,
            total: item?.contratos?.at(-1)?.teletrans?.at(-1)?.total,
            volquete: item?.contratos?.at(-1)?.teletrans?.at(-1)?.volquete,
            teletran: item?.contratos?.at(-1)?.teletrans?.at(-1)?.teletrans,
            fecha_inicio: dayjs(item?.contratos?.at(-1)?.fecha_inicio).format(
              "DD-MM-YYYY"
            ),
            fecha_fin: dayjs(item?.contratos?.at(-1)?.fecha_fin).format(
              "DD-MM-YYYY"
            ),
            pagos: pagos,
          };
        });
      })
      .filter((item) => item?.aprobacion)
      .map((item, i) => {
        return {
          id: i + 1,
          ...item,
        };
      });
    return res.status(200).json({ data: formatAsociacion });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

//lista de asociaciones para pago programado
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
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

//para obtener los trabajadores aprobados par aprogramar en programacion de pagos
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
          model: trabajador_contrato,
          include: [
            {
              model: contrato,
              attributes: { exclude: ["contrato_id"] },
              where: {
                finalizado: { [Op.not]: true },
              },
              include: [
                { model: teletrans },
                {
                  model: contrato_pago,
                  attributes: { exclude: ["contrato_pago_id"] },
                  include: [{ model: pago }],
                },
                { model: aprobacion_contrato_pago },
                { model: cargo, attributes: { exclude: ["cargo_id"] } },
              ],
            },
          ],
        },
      ],
    });

    const filterContrato = getPlanilla.filter(
      (item) => item.trabajador_contratos.length > 0
    );

    const filterAsistencia = filterContrato?.map((item, i) => {
      const contratoActivo = item?.trabajador_contratos?.filter(
        (data) => data.contrato.finalizado === false
      );
      return {
        dni: item?.dni,
        codigo_trabajador: item?.codigo_trabajador,
        fecha_nacimiento: item?.fecha_nacimiento,
        telefono: item?.telefono,
        nombre:
          item?.apellido_paterno +
          " " +
          item?.apellido_materno +
          " " +
          item?.nombre,
        cargo: contratoActivo
          ?.map((data) => data?.contrato?.cargo?.nombre)
          .toString(),
        fecha_inicio: dayjs(
          contratoActivo?.map((data) => data?.contrato?.fecha_inicio).toString()
        ).format("DD-MM-YYYY"),
        fecha_fin: dayjs(
          contratoActivo?.map((data) => data?.contrato?.fecha_fin).toString()
        ).format("DD-MM-YYYY"),
        volquetes: contratoActivo
          ?.map((data) => data?.contrato?.teletrans.at(-1).volquete)
          .toString(),
        teletrans: contratoActivo
          ?.map((data) => data?.contrato?.teletrans.at(-1).teletrans)
          .toString(),
        total: contratoActivo
          ?.map((data) => data?.contrato?.teletrans.at(-1).total)
          .toString(),
        saldo: contratoActivo
          ?.map((data) => data?.contrato?.teletrans.at(-1).saldo)
          .toString(),
        contrato_pago: contratoActivo?.map((data) => data?.contrato_pagos),
        aprobacion: contratoActivo
          ?.map((data) => data?.aprobacion_contrato_pagos)
          ?.filter((data) => data?.estado === true && data?.pagado === null),
        contrato: item?.trabajador_contratos,
      };
    });

    return res.status(200).json({ data: filterAsistencia });
  } catch (error) {
    console.log(error);
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
  let id = req.params.id;

  try {
    const trabajadores = await trabajador.findAll({
      where: {
        dni: id,
        deshabilitado: { [Op.not]: true },
      },
      attributes: { exclude: ["usuarioId"] },
      include: [
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
                { model: aprobacion_contrato_pago },
              ],
            },
          ],
        },
        {
          model: trabajadorAsistencia,
          attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
          include: [{ model: asistencia, order: [["fecha", "ASC"]] }],
        },
      ],
    });

    const filterContrato = trabajadores.filter(
      (trabajador) =>
        trabajador.trabajador_contratos.length > 0 &&
        trabajador.trabajador_asistencia.length > 0
    );

    const aprobacionFilter = [];
    let subarrayId = 1;
    let contador = 0;
    const createSubarray = (
      trabajador,
      subAsistencias,
      fechaInicio,
      fechaFin
    ) => {
      const fechaInicioDayjs = dayjs(fechaInicio);
      const fechaFinDayjs = dayjs(fechaFin);
      const asistenciasEnRango = trabajador?.trabajador_asistencia?.filter(
        (asistencia) => {
          const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
          return (
            (fechaAsistencia.isSame(fechaInicioDayjs) ||
              fechaAsistencia.isAfter(fechaInicioDayjs)) &&
            (fechaAsistencia.isSame(fechaFinDayjs) ||
              fechaAsistencia.isBefore(fechaFinDayjs))
          );
        }
      );

      asistenciasEnRango.sort((a, b) => {
        return a.asistencium.fecha.localeCompare(b.asistencium.fecha);
      });

      const asistenciaCompleta = asistenciasEnRango.map((item, a) => {
        return {
          id: a + 1,
          asistencia: item?.asistencia,
          fecha: item?.asistencium?.fecha,
          hora_ingreso: item?.asistencium?.hora_ingreso,
          tarde: item?.tarde,
          observacion: item?.observacion,
        };
      });

      aprobacionFilter.push({
        subarray_id: subarrayId,
        nombre:
          trabajador?.apellido_paterno +
          " " +
          trabajador?.apellido_materno +
          " " +
          trabajador?.nombre,
        celular: trabajador?.telefono,
        dni: trabajador?.dni,
        fecha_inicio: dayjs(fechaInicio)?.format("DD-MM-YYYY"),
        fecha_fin: dayjs(fechaFin)?.format("DD-MM-YYYY"),
        volquete:
          trabajador?.trabajador_contratos[0]?.contrato?.teletrans?.at(-1)
            ?.volquete,
        teletran:
          trabajador.trabajador_contratos[0].contrato?.teletrans?.at(-1)
            ?.teletrans,
        total:
          trabajador.trabajador_contratos[0].contrato?.teletrans?.at(-1)?.total,
        trabajador_asistencia: asistenciasEnRango,
        cargo: trabajador?.trabajador_contratos[0]?.contrato?.puesto,
        asistencia: contador,
        asistencia_completa: asistenciaCompleta,
        estado:
          trabajador?.trabajador_contratos[0].contrato?.aprobacion_contrato_pagos
            ?.filter((item) => item.subarray_id == subarrayId)
            .at(0)?.estado,
        aprobacion_id:
          trabajador?.trabajador_contratos[0]?.contrato.aprobacion_contrato_pagos
            ?.filter((item) => item.subarray_id == subarrayId)
            .at(0)?.id,
        firma_jefe:
          trabajador?.trabajador_contratos[0]?.contrato?.aprobacion_contrato_pagos
            ?.filter((item) => item.subarray_id == subarrayId)
            .at(0)?.firma_jefe,
        firma_gerente:
          trabajador?.trabajador_contratos[0]?.contrato?.aprobacion_contrato_pagos
            ?.filter((item) => item.subarray_id == subarrayId)
            .at(0)?.firma_gerente,
        foto: trabajador?.trabajador_contratos[0]?.contrato?.aprobacion_contrato_pagos
          ?.filter((item) => item.subarray_id == subarrayId)
          .at(0)?.huella,
      });

      subarrayId++;
    };

    filterContrato.map((trabajador) => {
      const numAsistencias = trabajador?.trabajador_asistencia?.length;
      const minAsistencias = 15;

      if (numAsistencias >= 1) {
        let subAsistencias = [];
        let fechaInicio = null;
        let fechaFin = null;

        const sortedAsistencias = trabajador?.trabajador_asistencia?.sort(
          (a, b) => a.asistencium.fecha.localeCompare(b.asistencium.fecha)
        );

        for (let i = 0; i < numAsistencias; i++) {
          const asistencia = sortedAsistencias[i];
          if (
            asistencia.asistencia === "Asistio" ||
            asistencia.asistencia === "Comisión"
          ) {
            contador++;
          }

          subAsistencias.push(asistencia);

          if (contador === 1) {
            fechaInicio = asistencia.asistencium.fecha;
          }

          if (contador >= minAsistencias || i === numAsistencias - 1) {
            fechaFin = asistencia.asistencium.fecha;
            createSubarray(trabajador, subAsistencias, fechaInicio, fechaFin);

            // Actualiza la fecha de inicio del siguiente subarray.
            if (i < numAsistencias - 1) {
              fechaInicio = sortedAsistencias[i + 1].asistencium.fecha;
            }

            if (contador >= minAsistencias) {
              contador = 0;
            } else {
              contador = subAsistencias.length;
            }

            subAsistencias = [];
          }
        }
      }
    });

    return res.status(200).json({ data: aprobacionFilter });
  } catch (error) {
    console.log(error);
    res.status(500).json;
  }
};

const getTareoAsociacion = async (req, res, next) => {
  const id = req.params.id;

  try {
    const asociaciones = await asociacion.findAll({
      where: { id: id },
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          where: {
            finalizado: false,
          },
          include: [
            { model: teletrans },
            { model: aprobacion_contrato_pago },
            {
              model: trabajador_contrato,
              include: [
                {
                  model: trabajador,
                  attributes: { exclude: ["usuarioId"] },
                  include: [
                    {
                      model: trabajadorAsistencia,
                      attributes: {
                        exclude: ["trabajadorDni", "asistenciumId"],
                      },
                      include: [{ model: asistencia }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: trabajador,
          attributes: { exclude: ["usuarioId"] },
          include: [
            {
              model: trabajadorAsistencia,
              attributes: {
                exclude: ["trabajadorDni", "asistenciumId"],
              },
              include: [{ model: asistencia }],
            },
          ],
        },
      ],
    });
    const asociacionData = asociaciones.map((asociacion) => {
      return asociacion.contratos.flatMap((contrato) => {
        let fechaInicio = dayjs(contrato.fecha_inicio, [
          "YYYY-MM-DD",
          "YYYY-MM-DD HH:mm:ss",
        ]).toDate();
        let fechaFin = dayjs(contrato.fecha_fin, [
          "YYYY-MM-DD",
          "YYYY-MM-DD HH:mm:ss",
        ]).toDate();

        if (fechaInicio.getTime() > fechaFin.getTime()) {
          return [];
        }
        let subarrays = [];
        let subarrayId = 1;
        const contratoData = contrato;

        const trabajadores = contrato.trabajador_contratos.map(
          (tc) => tc.trabajador
        );
        const trabajadorMenorCodigo = trabajadores.reduce((prev, curr) => {
          return prev.codigo_trabajador < curr.codigo_trabajador ? prev : curr;
        });
        let fechaInicioSubarray = null;
        let fechaFinSubarray = null;
        let asistenciasPrimerTrabajador =
          trabajadorMenorCodigo.trabajador_asistencia.filter((asistencia) => {
            const asistenciaFecha = dayjs(asistencia?.asistencium?.fecha, [
              "YYYY-MM-DD",
              "YYYY-MM-DD HH:mm:ss",
            ]).toDate();
            return (
              asistenciaFecha.getTime() >= fechaInicio.getTime() &&
              asistenciaFecha.getTime() <= fechaFin.getTime()
            );
          });

        let contador = 0;
        let subAsistencias = [];
        const minAsistencias = 15;
        let currentIndex = 0;

        for (
          let currentIndex = 0;
          currentIndex < asistenciasPrimerTrabajador.length;

        ) {
          let asistencia = asistenciasPrimerTrabajador[currentIndex];
          if (
            asistencia?.asistencia === "Asistio" ||
            asistencia?.asistencia === "Comisión"
          ) {
            contador++;
            subAsistencias.push(asistencia);
            if (contador === 1) {
              fechaInicioSubarray = asistencia.asistencium.fecha;
            }
          }

          if (
            contador >= minAsistencias ||
            currentIndex === asistenciasPrimerTrabajador.length - 1
          ) {
            fechaFinSubarray = asistencia.asistencium.fecha;

            let validDates = new Set(
              asistenciasPrimerTrabajador.map((asistencia) =>
                dayjs(asistencia?.asistencium?.fecha, [
                  "YYYY-MM-DD",
                  "YYYY-MM-DD HH:mm:ss",
                ]).format("YYYY-MM-DD")
              )
            );

            let trabajadores = contrato.trabajador_contratos.map(
              (trabajador_contrato) => {
                const trabajador = trabajador_contrato.trabajador;
                const asistenciasObj = trabajador.trabajador_asistencia.reduce(
                  (acc, asistencia) => {
                    const asistenciaFecha = dayjs(
                      asistencia?.asistencium?.fecha,
                      ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss"]
                    ).format("YYYY-MM-DD");

                    if (validDates.has(asistenciaFecha)) {
                      acc[asistenciaFecha] = asistencia?.asistencia;
                    }

                    return acc;
                  },
                  {}
                );

                const asistenciasArray = Array.from(validDates).reduce(
                  (acc, fecha) => {
                    acc[fecha] =
                      asistenciasObj[fecha] === "Permiso"
                        ? "P"
                        : asistenciasObj[fecha] === "Asistio"
                        ? "X"
                        : asistenciasObj[fecha] === "Falto"
                        ? "F"
                        : asistenciasObj[fecha] === "Dia libre"
                        ? "DL"
                        : asistenciasObj[fecha] === "Comision"
                        ? "C"
                        : "F" || null;
                    return acc;
                  },
                  {}
                );

                return {
                  dni: trabajador?.dni,
                  nombres:
                    trabajador?.apellido_paterno +
                    " " +
                    trabajador?.apellido_materno +
                    " " +
                    trabajador?.nombre,
                  celular: trabajador?.telefono,
                  ...asistenciasArray,
                  estado: trabajador?.trabajador_contratos,
                };
              }
            );
            subarrays.push({
              subArray_id: subarrayId,
              nombre: asociacion.nombre,
              fecha_inicio: dayjs(fechaInicioSubarray).format("DD-MM-YYYY"),
              fecha_fin: dayjs(fechaFinSubarray).format("DD-MM-YYYY"),
              asistencia: asistenciasPrimerTrabajador.length,
              trabajadores: trabajadores,
              estado: contratoData.aprobacion_contrato_pagos
                ?.filter((item) => item.subarray_id == subarrayId)
                .at(0)?.estado,
              aprobacion_id: contratoData.aprobacion_contrato_pagos
                ?.filter((item) => item.subarray_id == subarrayId)
                .at(0)?.id,
              firma_jefe: contratoData.aprobacion_contrato_pagos
                ?.filter((item) => item.subarray_id == subarrayId)
                .at(0)?.firma_jefe,
              firma_gerente: contratoData.aprobacion_contrato_pagos
                ?.filter((item) => item.subarray_id == subarrayId)
                .at(0)?.firma_gerente,
            });

            subarrayId++;
            contador = 0;
            subAsistencias = [];
            fechaInicioSubarray = null;
          }
          currentIndex++;
        }

        return subarrays;
      });
    });

    res.status(200).json({ data: asociacionData.flat() });
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

const updateTrabajadorAsistencia = async (req, res, next) => {
  let id = req.params.id;
  const {
    contrato_id,
    firma_jefe,
    firma_gerente,
    huella,
    tipo,
    estado,
    subarray_id,
    observaciones,
  } = req.body;

  try {
    let aprobacionData;

    if (id === "0") {
      // Si id es 0, crear una nueva aprobación
      aprobacionData = await aprobacion_contrato_pago.create({
        contrato_id,
        tipo,
        firma_jefe,
        firma_gerente,
        estado,
        subarray_id,
      });

      return res.status(200).json({
        msg: "Aprobación actualizada con éxito!",
        status: 200,
      });
    } else {
      // Si id es distinto de 0, actualizar una aprobación existente
      aprobacionData = await aprobacion_contrato_pago.findOne({
        where: { id: id },
      });

      if (aprobacionData) {
        // Si ya existe, actualizar los valores
        aprobacionData.firma_jefe = firma_jefe;
        aprobacionData.firma_gerente = firma_gerente;
        aprobacionData.subarray_id = subarray_id;
        aprobacion.observaciones = observaciones;

        await aprobacionData.save();

        aprobacionDataActulizado = await aprobacion_contrato_pago.findOne({
          where: { id: id },
        });
        if (
          aprobacionDataActulizado.firma_jefe &&
          aprobacionDataActulizado.firma_gerente
        ) {
          aprobacionDataActulizado.estado = true;
        } else {
          aprobacionDataActulizado.estado = false;
        }

        aprobacionDataActulizado.save();
        return res.status(200).json({
          msg: "Aprobación actualizada con éxito!",
          status: 200,
        });
      }
    }

    return res.status(404).json({
      msg: "No se actualizar.",
      status: 404,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const updateHuella = async (req, res, next) => {
  let id = req.params.id;
  try {
    let info;
    if (req.file && req?.body?.huella !== undefined && req.body.huella !== "") {
      const fileDir = require("path").resolve(__dirname, `./upload/images/`);

      const editFotoLink = req.body.huella.split("/").at(-1);
      fs.unlink("./upload/images/" + editFotoLink, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("eliminado con éxito!");
        }
      });
    }
    info = {
      huella: req.file
        ? process.env.LOCAL_IMAGE + req.file.filename
        : req.body.huella,
      estado: true,
    };
    const putAsistencia = await aprobacion_contrato_pago.update(info, {
      where: { id: id },
    });
    return res.status(200).json({ msg: "Registrado con éxito!", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
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
  updateTrabajadorAsistencia,
  updateHuella,
  getPlanillaHistoriaTrabajador,
};
