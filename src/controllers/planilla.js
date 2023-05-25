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
  sequelize,
} = require("../../config/db");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

//lista de trabajadores y planillas para la vista de planillas
const getPlanilla = async (req, res, next) => {
  try {
    const gettraba = trabajador.findAll({
      where: {
        asociacion_id: { [Op.is]: null },
        deshabilitado: { [Op.not]: true },
      },
      attributes: [
        "nombre",
        "apellido_paterno",
        "apellido_materno",
        "telefono",
        "asociacion_id",
        "dni",
        "fecha_nacimiento",
      ],
      include: [
        {
          model: trabajadorAsistencia,
          attributes: ["id", "asistencia_id", "asistencia", "trabajador_id"],
          include: [
            {
              model: asistencia,
              attributes: ["id", "fecha"],
            },
          ],
        },
        {
          model: evaluacion,
          attributes: ["id", "condicion_cooperativa", "recomendado_por"],
        },
        {
          model: trabajador_contrato,
          attributes: { exclude: ["contrato_id"] },

          include: [
            {
              model: contrato,
              attributes: [
                "suspendido",
                "fecha_inicio",
                "fecha_fin",
                "fecha_fin_estimada",
                "periodo_trabajo",
                "suspendido",
              ],
              where: {
                finalizado: false,
                suspendido: { [Op.not]: true },
              },
              include: [
                { model: teletrans },
                {
                  model: campamento,
                  attributes: { exclude: ["campamento_id"] },
                },

                { model: gerencia, attributes: ["nombre"] },
                { model: area, attributes: ["nombre"] },
                {
                  model: cargo,
                  attributes: ["nombre"],
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
          attributes: [
            "suspendido",
            "fecha_inicio",
            "fecha_fin",
            "fecha_fin_estimada",
            "finalizado",
            "periodo_trabajo",
          ],
          include: [
            { model: teletrans },
            {
              model: campamento,
              attributes: { exclude: ["campamento_id"] },
            },
            { model: gerencia, attributes: ["nombre"] },
            { model: area, attributes: ["nombre"] },
            {
              model: cargo,
              attributes: ["nombre"],
            },
          ],
        },
        {
          model: trabajador,
          attributes: [
            "nombre",
            "apellido_paterno",
            "apellido_materno",
            "telefono",
            "codigo_trabajador",
          ],
          include: [
            {
              model: trabajadorAsistencia,
              attributes: [
                "id",
                "asistencia_id",
                "asistencia",
                "trabajador_id",
              ],
              include: [{ model: asistencia, attributes: ["id", "fecha"] }],
            },
          ],
        },
      ],
    });

    const [traba, asoci] = await Promise.all([gettraba, getasoci]);

    const filterAsociacion = asoci?.filter(
      (item) => item?.contratos?.length > 0
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
          const contratoActivo = item?.contratos?.find(
            (data) => data.finalizado === false
          );

          const fechaInicioContrato = dayjs(
            item?.contratos?.find((data) => data.finalizado === false)
              ?.fecha_inicio
          );
          const fechaFinContrato =
            dayjs(
              item?.contratos?.find((data) => data.finalizado === false)
                ?.fecha_fin_estimada
            ) ||
            dayjs(
              item?.contratos?.find((data) => data.finalizado === false)
                ?.fecha_fin
            );

          const asistencia =
            trabajadorCodigoMenor?.trabajador_asistencia?.filter((data) => {
              const fechaAsistencia = dayjs(data.asistencium.fecha);
              return (
                ["Asistio", "Comisión"].includes(data.asistencia) &&
                (fechaAsistencia.isSame(fechaInicioContrato) ||
                  fechaAsistencia.isAfter(fechaInicioContrato)) &&
                (fechaAsistencia.isSame(fechaFinContrato) ||
                  fechaAsistencia.isBefore(fechaFinContrato))
              );
            }).length;

          return {
            nombre: item?.nombre,
            asociacion_id: item?.id,
            codigo: item?.codigo,
            fecha_inicio: dayjs(contratoActivo?.fecha_inicio).format(
              "DD-MM-YYYY"
            ),
            fecha_fin:
              dayjs(contratoActivo?.fecha_fin_estimada).format("DD-MM-YYYY") ||
              dayjs(contratoActivo?.fecha_fin).format("DD-MM-YYYY"),

            contratos: contratoActivo,
            volquete: contratoActivo?.teletrans.at(-1)?.volquete,
            puesto: "",
            campamento: contratoActivo?.campamento?.nombre.toString(),
            teletran: contratoActivo?.teletrans.at(-1)?.teletrans,
            total: contratoActivo?.teletrans.at(-1)?.total,
            saldo: contratoActivo?.teletrans.at(-1)?.saldo,
            asistencia: asistencia,
            area: contratoActivo?.area.nombre,
            periodo_trabajo:contratoActivo?.periodo_trabajo,
            puesto: item?.tipo,
          };
        })
        .filter((item) => item.contratos);

    // trabajador
    const filterTrabajador = traba?.filter(
      (item) => item?.trabajador_contratos?.length > 0
    );
    const mapTrabajador = filterTrabajador?.map((item, i) => {
      const contratoFiltrado = item?.trabajador_contratos?.filter(
        (data) => data.contrato
      );
      const contratoFinal = item?.trabajador_contratos?.filter(
        (data) => data.contrato
      );
      // Encuentra la fecha de inicio más temprana y la fecha de finalización más tardía
      let fechaInicioContrato = contratoFiltrado[0]?.contrato?.fecha_inicio;
      let fechaFinContrato =
        contratoFiltrado[0]?.contrato?.fecha_fin_estimada ||
        contratoFiltrado[0]?.contrato?.fecha_fin;
      contratoFiltrado.forEach((dat) => {
        if (dayjs(dat?.contrato?.fecha_inicio).isBefore(fechaInicioContrato)) {
          fechaInicioContrato = dat?.contrato?.fecha_inicio;
        }
        const fechaFin =
          dat?.contrato?.fecha_fin_estimada || dat?.contrato?.fecha_fin;
        if (dayjs(fechaFin).isAfter(fechaFinContrato)) {
          fechaFinContrato = fechaFin;
        }
      });

      // Ahora usa las fechas de inicio y fin con dayjs
      fechaInicioContrato = dayjs(fechaInicioContrato);
      fechaFinContrato = dayjs(fechaFinContrato);
      const asistencia = item.trabajador_asistencia.filter((data) => {
        const fechaAsistencia = dayjs(data.asistencium.fecha).startOf("day");
        return (
          (fechaAsistencia.isSame(fechaInicioContrato) ||
            fechaAsistencia.isAfter(fechaInicioContrato)) &&
          (fechaAsistencia.isBefore(fechaFinContrato) ||
            fechaAsistencia.isSame(fechaFinContrato)) &&
          (data.asistencia === "Asistio" || data.asistencia === "Comisión")
        );
      }).length;

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
        contratos: contratoFinal.contrato,
        gerencia: contratoFiltrado?.at(0)?.contrato?.gerencia?.nombre,
        area: contratoFiltrado?.at(0)?.contrato?.area.nombre,
        puesto: contratoFiltrado?.at(0)?.contrato?.cargo?.nombre,
        suspendido: contratoFiltrado?.at(0)?.contrato?.suspendido,
        periodo_trabajo: contratoFiltrado
          ?.map((dat) => dat?.contrato?.periodo_trabajo)
          .toString(),
        fecha_inicio: dayjs(fechaInicioContrato).format("DD-MM-YYYY"),
        fecha_fin: dayjs(fechaFinContrato).format("DD-MM-YYYY"),
        campamento: contratoFiltrado
          ?.map((dat) => dat?.contrato?.campamento?.nombre)
          .toString(),
        asistencia: asistencia,
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

//lista de asociaciones con trabajadores para la tabla asocicion para prograrmar
const getListaPago = async (req, res, next) => {
  try {
    const allAsociaciones = await asociacion.findAll();
    const allAprobaciones = await aprobacion_contrato_pago.findAll({
      where: { dni: { [Op.is]: null }, estado: true },
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },

          include: [
            {
              model: trabajador_contrato, // Aquí incluyes el modelo trabajador_contrato
              include: [
                {
                  model: trabajador,
                  attributes: { exclude: ["usuarioId"] },
                },
              ],
            },
            { model: teletrans },
            {
              model: contrato_pago,
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
          ],
        },
      ],
    });

    const formatData = allAprobaciones
      ?.map((item, i) => {
        const trabajadoresProgramados = item?.contrato?.contrato_pagos
          ?.filter((data) => data.quincena === item.subarray_id)
          .map((data) => {
            const resultado = [];
            data.pago_asociacions.forEach((pago) => {
              const { trabajador_dni, teletrans } = pago;

              // Verificar si ya existe un objeto con el mismo trabajador_dni y quincena en el resultado
              const objetoExistente = resultado.find(
                (item) =>
                  item.trabajador_dni === trabajador_dni &&
                  item.quincena === data.quincena
              );

              const teletransNumber = parseFloat(teletrans); // Convertir a número

              if (objetoExistente) {
                // Si ya existe, se suma el teletrans al objeto existente
                objetoExistente.teletrans += teletransNumber;
              } else {
                // Si no existe, se agrega un nuevo objeto al resultado
                resultado.push({
                  trabajador_dni,
                  quincena: data.quincena,
                  teletrans: teletransNumber,
                });
              }
            });

            return resultado;
          })
          .flat();

        const totalVolquetes = item?.contrato?.contrato_pagos
          ?.filter((data) => data.quincena === item.subarray_id)
          .reduce((accumulator, current) => {
            return accumulator + parseInt(current.volquetes);
          }, 0);

        const pagos = {
          trabajadores: item?.contrato?.trabajador_contratos
            .map((trabajador, i) => {
              const trabajadorProgramado = trabajadoresProgramados.reduce(
                (acc, item) => {
                  if (item.trabajador_dni === trabajador.trabajador.dni) {
                    acc += item.teletrans;
                  }
                  return acc;
                },
                0
              );

              return {
                id: i + 1,
                teletrans: trabajadorProgramado,
                dni: trabajador.trabajador.dni,
                nombre: `${trabajador.trabajador.apellido_paterno} ${trabajador.trabajador.apellido_materno} ${trabajador.trabajador.nombre}`,
                telefono: trabajador.trabajador.telefono,
                cargo: item.tipo,
                programado: trabajadorProgramado > 0,
                contrato_id: item?.contratos?.at(-1)?.id,
              };
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre)),
        };

        const saldoFinal =
          parseFloat(item?.contrato?.teletrans?.at(-1)?.saldo) -
          parseFloat(totalVolquetes * 4);
        const asociacion = allAsociaciones.find(
          (ele) => ele.id == item.asociacion_id
        );
        if (saldoFinal < 1) {
          updateEstadoAprobacionContratoPago(item.id);
        }
        if (saldoFinal > 0) {
          return {
            id: i + 1,
            dni: "---",
            nombre: asociacion.nombre + " - " + item.subarray_id,
            tipo: asociacion.tipo,
            asociacion_id: asociacion.id,
            contrato_id: item?.contrato?.id,
            aprobacion: {
              id: item.id,
              firma_jefe: item.firma_jefe,
              firma_gerente: item.firma_gerente,
              huella: item.huella,
              estado: item.estado,
              fecha_inicio: item.fecha_inicio,
              subarray_id: item.subarray_id,
              pagado: item.pagado,
              fecha_fin: item.fecha_fin,
              nombre: item.nombre,
              dias_laborados: item.dias_laborados,
              volquete: item.volquete,
              teletran: item.teletran,
              asociacion_id: item.asociacion_id,
              dni: item.dni,
              observaciones: item.observaciones,
            },
            saldo: item?.contrato?.teletrans?.at(-1)?.saldo,
            total_modificado: saldoFinal,
            total: item?.contrato?.teletrans?.at(-1)?.total,
            volquete: item?.contrato?.teletrans?.at(-1)?.volquete,
            teletran: item?.contrato?.teletrans?.at(-1)?.teletrans,
            fecha_inicio: item.fecha_inicio,
            fecha_fin: item.fecha_fin,
            pagos: pagos,
            quincena: item.subarray_id,
            estado: item.estado,
            totalVolquetes: totalVolquetes,
          };
        }
      })
      .filter((item) => item?.aprobacion?.estado);

    return res.status(200).json({ data: formatData });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

async function updateEstadoAprobacionContratoPago(id) {
  try {
    await aprobacion_contrato_pago.update(
      { pagado: true },
      { where: { id: id } }
    );
  } catch (error) {
    console.log(error);
  }
}

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
                finalizado: false,
                suspendido: false,
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

    const filterContrato = trabajadores?.filter(
      (trabajador) =>
        trabajador?.trabajador_contratos?.length > 0 &&
        trabajador?.trabajador_asistencia?.length > 0
    );
    const aprobacionFilter = [];
    let subarrayId = 1;

    const createSubarray = (
      trabajador,
      subAsistencias,
      fechaInicio,
      fechaFin,
      contador
    ) => {
      const fechaInicioDayjs = dayjs(fechaInicio);
      const fechaFinDayjs = dayjs(fechaFin);
      let asistenciasValidas = 0;
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

      asistenciasEnRango.forEach((asistencia) => {
        if (["Asistio", "Comisión"].includes(asistencia.asistencia)) {
          asistenciasValidas++;
        }
      });

      asistenciasEnRango.sort((a, b) => {
        return a.asistencium.fecha.localeCompare(b.asistencium.fecha);
      });

      const contrato = trabajador.trabajador_contratos[0].contrato;
      const teletrans = { ...contrato?.teletrans?.slice(-1)[0] };

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

      const aprobacionFiltered =
        contrato.aprobacion_contrato_pagos?.find(
          (item) => item.subarray_id === subarrayId
        ) || {};

      aprobacionFilter.push({
        subarray_id: subarrayId,
        nombre: `${trabajador?.apellido_paterno} ${trabajador?.apellido_materno} ${trabajador?.nombre}`,
        celular: trabajador?.telefono,
        dni: trabajador?.dni,
        fecha_inicio: dayjs(fechaInicio)?.format("DD-MM-YYYY"),
        fecha_fin: dayjs(fechaFin)?.format("DD-MM-YYYY"),
        volquete: teletrans.volquete,
        teletran: teletrans.teletrans,
        total: teletrans.total,
        trabajador_asistencia: asistenciasEnRango,
        cargo: contrato.puesto,
        asistencia: asistenciasValidas,
        asistencia_completa: asistenciaCompleta,
        estado: aprobacionFiltered.estado,
        aprobacion_id: aprobacionFiltered.id,
        firma_jefe: aprobacionFiltered.firma_jefe,
        firma_gerente: aprobacionFiltered.firma_gerente,
        foto: aprobacionFiltered.huella,
      });

      subarrayId++;
    };

    if (!filterContrato) {
      return;
    }
    filterContrato.map((trabajador) => {
      const tareo = trabajador.trabajador_contratos[0].contrato.tareo;
      if (tareo === "Lunes a sabado") {
        let contador = 0;
        let subAsistencias = [];
        let fechaInicio = null;
        let fechaFin = null;

        const contratoFechaInicio = dayjs(
          trabajador.trabajador_contratos[0].contrato.fecha_inicio
        );

        const contratoFechaFin = dayjs(
          trabajador.trabajador_contratos[0].contrato.fecha_fin_estimada ||
            trabajador.trabajador_contratos[0].contrato.fecha_fin
        );

        const minAsistencias = 15;
        const sortedAsistencias = trabajador?.trabajador_asistencia
          ?.filter((asistencia) => {
            const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
            return (
              (fechaAsistencia.isSame(contratoFechaInicio) ||
                fechaAsistencia.isAfter(contratoFechaInicio)) &&
              (fechaAsistencia.isBefore(contratoFechaFin) ||
                fechaAsistencia.isSame(contratoFechaFin))
            );
          })
          .sort((a, b) =>
            a.asistencium.fecha.localeCompare(b.asistencium.fecha)
          );

        const numAsistencias = sortedAsistencias.length;

        if (numAsistencias >= 1) {
          for (let i = 0; i < numAsistencias; i++) {
            const asistencia = sortedAsistencias[i];

            if (
              asistencia &&
              ["Asistio", "Comisión"].includes(asistencia.asistencia)
            ) {
              contador++;
            }

            // Creamos subarray cuando se alcance el mínimo de asistencias.
            if (contador > minAsistencias) {
              fechaFin =
                subAsistencias[subAsistencias.length - 1].asistencium.fecha;

              createSubarray(
                trabajador,
                subAsistencias,
                fechaInicio,
                fechaFin,
                contador - 1 // Restamos uno para no contar la asistencia actual en este subarray
              );

              // Preparación para el siguiente subarray
              contador = 1; // Iniciamos en 1 para incluir la asistencia actual
              subAsistencias = []; // Limpiamos el arreglo de asistencias
              fechaInicio = asistencia.asistencium.fecha; // Tomamos la fecha actual como inicio del siguiente subarray
            }

            // La asistencia se agrega al subarray después de verificar si se ha alcanzado el límite
            subAsistencias.push(asistencia);

            if (contador === 1 && !fechaInicio) {
              fechaInicio = asistencia.asistencium.fecha;
            }

            // Creamos el último subarray cuando llegamos a la última asistencia
            if (i === numAsistencias - 1) {
              fechaFin = asistencia.asistencium.fecha;

              createSubarray(
                trabajador,
                subAsistencias,
                fechaInicio,
                fechaFin,
                contador
              );
            }
          }
        }
      } else if (tareo === "Mes cerrado") {
        // Calcula las quincenas y divide las asistencias en subarrays en base a ellas...

        const contratoFechaInicio = dayjs(
          trabajador.trabajador_contratos[0].contrato.fecha_inicio
        );

        const contratoFechaFin =
          dayjs(
            trabajador.trabajador_contratos[0].contrato.fecha_fin_estimada
          ) || dayjs(trabajador.trabajador_contratos[0].contrato.fecha_fin);

        const sortedAsistencias = trabajador?.trabajador_asistencia
          ?.filter((asistencia) => {
            const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
            return (
              (fechaAsistencia.isSame(contratoFechaInicio) ||
                fechaAsistencia.isAfter(contratoFechaInicio)) &&
              (fechaAsistencia.isSame(contratoFechaFin) ||
                fechaAsistencia.isBefore(contratoFechaFin)) &&
              ["Asistio", "Comisión"].includes(asistencia.asistencia)
            );
          })
          .sort((a, b) =>
            a.asistencium.fecha.localeCompare(b.asistencium.fecha)
          );

        let daysInCurrentMonth;

        let subAsistencias = [];
        let fechaInicio = null;
        let fechaFin = null;

        // Día de división inicial
        let splitDay = 15;
        let pendingDays = 0;

        sortedAsistencias.forEach((asistencia, i) => {
          const fechaAsistencia = dayjs(asistencia.asistencium.fecha);

          if (!fechaInicio) {
            fechaInicio = asistencia.asistencium.fecha;
            splitDay = fechaAsistencia.daysInMonth() === 31 ? 16 : 15;
          }

          subAsistencias.push(asistencia);

          // Si hemos llegado al final de las asistencias
          // o si hemos alcanzado el límite de la quincena y no hay días pendientes
          if (
            i === sortedAsistencias.length - 1 ||
            (subAsistencias.length >= splitDay && !pendingDays)
          ) {
            fechaFin = asistencia.asistencium.fecha;
            createSubarray(
              trabajador,
              subAsistencias,
              fechaInicio,
              fechaFin,
              subAsistencias.length
            );
            fechaInicio = fechaAsistencia.add(1, "day").format("YYYY-MM-DD");
            splitDay = fechaAsistencia.daysInMonth() - splitDay;
            subAsistencias = [];
          } else if (subAsistencias.length >= splitDay && pendingDays) {
            // Si hemos alcanzado el límite de la quincena pero aún hay días pendientes
            fechaFin = asistencia.asistencium.fecha;
            createSubarray(
              trabajador,
              subAsistencias,
              fechaInicio,
              fechaFin,
              subAsistencias.length
            );
            fechaInicio = fechaAsistencia.add(1, "day").format("YYYY-MM-DD");
            splitDay = pendingDays;
            pendingDays = 0;
            subAsistencias = [];
          }

          // Si hemos llegado al final del mes y no hemos llegado al límite de la quincena
          if (
            fechaAsistencia.date() === fechaAsistencia.daysInMonth() &&
            subAsistencias.length < splitDay
          ) {
            pendingDays = splitDay - subAsistencias.length;
          }
        });

        if (subAsistencias.length > 0) {
          // Asegurándonos de agregar el último subarray si hay asistencias pendientes
          createSubarray(
            trabajador,
            subAsistencias,
            fechaInicio,
            fechaFin,
            subAsistencias.length
          );
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
          where: { finalizado: false },

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
        let fechaInicioData = dayjs(contrato.fecha_inicio);
        let fechaFinData =
          dayjs(contrato.fecha_fin_estimada) || dayjs(contrato.fecha_fin);

        if (fechaInicio.getTime() > fechaFin.getTime()) {
          return [];
        }

        let subarrays = [];
        let subarrayId = 1;

        const trabajadores = contrato.trabajador_contratos.map(
          (tc) => tc.trabajador
        );
        const trabajadorMenorCodigo = trabajadores.reduce((prev, curr) => {
          return prev.codigo_trabajador < curr.codigo_trabajador ? prev : curr;
        });
        let fechaInicioSubarray = null;
        let fechaFinSubarray = null;

        let asistenciasPrimerTrabajador =
          trabajadorMenorCodigo.trabajador_asistencia
            .filter((asistencia) => {
              const asistenciaFecha = dayjs(asistencia?.asistencium?.fecha, [
                "YYYY-MM-DD",
                "YYYY-MM-DD HH:mm:ss",
              ]);
              return (
                (asistenciaFecha.isSame(fechaInicioData) ||
                  asistenciaFecha.isAfter(fechaInicioData)) &&
                (asistenciaFecha.isSame(fechaFinData) ||
                  asistenciaFecha.isBefore(fechaFinData))
              );
            })
            .sort((a, b) => {
              const dateA = dayjs(a.asistencium.fecha, [
                "YYYY-MM-DD",
                "YYYY-MM-DD HH:mm:ss",
              ]).toDate();
              const dateB = dayjs(b.asistencium.fecha, [
                "YYYY-MM-DD",
                "YYYY-MM-DD HH:mm:ss",
              ]).toDate();

              return dateA - dateB;
            });

        let contador = 0;
        let subAsistencias = [];
        const minAsistencias = 15;
        let currentIndex = 0;

        while (currentIndex < asistenciasPrimerTrabajador.length) {
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
              subAsistencias.map((asistencia) =>
                dayjs(asistencia?.asistencium?.fecha, [
                  "YYYY-MM-DD",
                  "YYYY-MM-DD HH:mm:ss",
                ]).format("YYYY-MM-DD")
              )
            );

            const trabajadores = contrato.trabajador_contratos.map(
              (trabajador) => {
                const asistenciasArray = Array.from(validDates).reduce(
                  (acc, fecha) => {
                    const asistencia =
                      trabajador?.trabajador?.trabajador_asistencia &&
                      trabajador?.trabajador?.trabajador_asistencia.find(
                        (asistencia) =>
                          dayjs(asistencia.asistencium.fecha).format(
                            "YYYY-MM-DD"
                          ) === fecha
                      )?.asistencia;

                    acc[fecha] =
                      asistencia === "Permiso"
                        ? "P"
                        : asistencia === "Asistio"
                        ? "X"
                        : asistencia === "Falto"
                        ? "F"
                        : asistencia === "Dia libre"
                        ? "DL"
                        : asistencia === "Comision"
                        ? "C"
                        : "";
                    return acc;
                  },
                  {}
                );
                return {
                  dni: trabajador?.trabajador?.dni,
                  nombres:
                    trabajador?.trabajador?.apellido_paterno +
                    " " +
                    trabajador?.trabajador?.apellido_materno +
                    " " +
                    trabajador?.trabajador?.nombre,
                  celular: trabajador?.trabajador?.telefono,
                  ...asistenciasArray,
                  estado: trabajador?.trabajador?.trabajador_contratos,
                };
              }
            );

            const aprobacionData = contrato.aprobacion_contrato_pagos
              ?.filter((item) => item.subarray_id == subarrayId)
              .slice(-1)[0];
            subarrays.push({
              subarray_id: subarrayId,
              nombre: asociacion.nombre,
              asociacion_id: asociacion.id,
              fecha_inicio: dayjs(fechaInicioSubarray).format("DD-MM-YYYY"),
              fecha_fin: dayjs(fechaFinSubarray).format("DD-MM-YYYY"),
              asistencia: contador,
              trabajadores: trabajadores,
              estado: aprobacionData?.estado,
              aprobacion_id: aprobacionData?.id,
              firma_jefe: aprobacionData?.firma_jefe,
              firma_gerente: aprobacionData?.firma_gerente,
              observaciones: aprobacionData?.observaciones,
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
    console.log(req.body);
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
        aprobacionData.observaciones = observaciones;

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
