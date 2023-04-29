const {
  contrato,
  trabajador,
  trabajadorAsistencia,
  trabajador_contrato,
  asistencia,
  asociacion,
  evaluacion,
  teletrans,
  aprobacion_contrato_pago,
} = require("../../config/db");
const cron = require("node-cron");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

function contarDomingos(fechaInicio, fechaFin) {
  let contador = 0;
  let fechaActual = fechaInicio;

  while (fechaActual.isBefore(fechaFin)) {
    if (fechaActual.day() === 0) {
      contador++;
    }
    fechaActual = fechaActual.add(1, "day");
  }

  return contador;
}

function calcularCantidadReal(trabajadorAsistencias) {
  let cantidadReal = 0;
  trabajadorAsistencias.forEach((asistencia) => {
    const estadoAsistencia = asistencia.asistencia;
    if (estadoAsistencia === "Asistio" || estadoAsistencia === "Comisión") {
      cantidadReal++;
    }
  });
  return cantidadReal;
}

//lista de trabajadores y planillas para la vista de planillas
const getPlanillaAprobacion = async () => {
  try {
    const trabajadores = trabajador.findAll({
      where: {
        asociacion_id: { [Op.is]: null },
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

    const asociaciones = asociacion.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          where: {
            finalizado: false,
          },
          include: [
            { model: teletrans },
            {
              model: aprobacion_contrato_pago,
              attributes: { exclude: ["fecha"] },
            },
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

    const [trabajadorFetch, asociacionFetch] = await Promise.all([
      trabajadores,
      asociaciones,
    ]);

    const asociacionData = asociacionFetch
      .map((asociacion) => {
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
            return prev.codigo_trabajador < curr.codigo_trabajador
              ? prev
              : curr;
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

          let contadorAsistencias = 0;
          asistenciasPrimerTrabajador.forEach((asistencia, index) => {
            if (
              asistencia?.asistencia === "asistio" ||
              asistencia?.asistencia === "comision"
            ) {
              contadorAsistencias++;
            }

            if (
              contadorAsistencias === 15 ||
              index === asistenciasPrimerTrabajador.length - 1
            ) {
              fechaInicioSubarray = dayjs(
                asistenciasPrimerTrabajador[0]?.asistencium?.fecha,
                ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss"]
              ).toDate();
              fechaFinSubarray = dayjs(
                asistenciasPrimerTrabajador[
                  asistenciasPrimerTrabajador.length - 1
                ]?.asistencium?.fecha,
                ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss"]
              ).toDate();

              subarrays.push({
                subArray_id: subarrayId,
                asociacion_id: asociacion.id,
                nombre: asociacion.nombre,
                fecha_inicio: dayjs(fechaInicioSubarray).format("DD-MM-YYYY"),
                fecha_fin: dayjs(fechaFinSubarray).format("DD-MM-YYYY"),
                asistencia: asistenciasPrimerTrabajador.length,
                volquete: contratoData.teletrans.at(-1).volquete,
                teletran: contratoData.teletrans.at(-1).teletran,
                total: contratoData.teletrans.at(-1).saldo,
                contrato_id: contratoData.id,
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
            }
          });

          return subarrays;
        });
      })
      .filter((item) => item.length > 0)
      .flat();

    const filterContrato = trabajadorFetch.filter(
      (trabajador) =>
        trabajador.trabajador_contratos.length > 0 &&
        trabajador.trabajador_asistencia.length > 0
    );

    const aprobacionFilter = [];
    let subarrayId = 1;
    filterContrato.forEach((trabajador) => {
      const asistencias = trabajador?.trabajador_asistencia?.filter(
        (asistencia) => asistencia.asistencia === "Asistio"
      );

      const numAsistencias = asistencias?.length;
      if (numAsistencias >= 15) {
        let contador = 0;
        let subAsistencias = [];
        let fechaInicio = null;
        let fechaFin = null;
        for (let i = 0; i < numAsistencias; i++) {
          const asistencia = asistencias[i];
          if (
            asistencia.asistencia === "Asistio" ||
            asistencia.asistencia === "Comisión"
          ) {
            contador++;
            subAsistencias.push(asistencia);
            if (contador === 1) {
              fechaInicio = asistencia.asistencium.fecha;
            }
            if (contador === 15) {
              fechaFin = asistencia.asistencium.fecha;

              aprobacionFilter.push({
                subArray_id: subarrayId,
                dni:trabajador.dni,
                nombre:
                  trabajador.apellido_paterno +
                  " " +
                  trabajador.apellido_materno +
                  " " +
                  trabajador.nombre,
                celular: trabajador.telefono,
                fecha_inicio: dayjs(fechaInicio).format("DD-MM-YYYY"),
                fecha_fin: dayjs(fechaFin).format("DD-MM-YYYY"),
                volquete:
                  trabajador.trabajador_contratos[0].contrato?.teletrans?.at(-1)
                    ?.volquete,
                teletran:
                  trabajador.trabajador_contratos[0].contrato?.teletrans?.at(-1)
                    ?.teletrans,
                total:
                  trabajador.trabajador_contratos[0].contrato?.teletrans?.at(-1)
                    ?.total,
                contrato_id: trabajador.trabajador_contratos[0].contrato?.id,

                asistencia: contador,

                aprobacion_id:
                  trabajador.trabajador_contratos[0].contrato?.aprobacion_contrato_pagos
                    ?.filter((item) => item.subarray_id == subarrayId)
                    .at(0)?.id,
                firma_jefe:
                  trabajador.trabajador_contratos[0].contrato?.aprobacion_contrato_pagos
                    ?.filter((item) => item.subarray_id == subarrayId)
                    .at(0)?.firma_jefe,
                firma_gerente:
                  trabajador.trabajador_contratos[0].contrato?.aprobacion_contrato_pagos
                    ?.filter((item) => item.subarray_id == subarrayId)
                    .at(0)?.firma_gerente,
              });
              contador = 0;
              subAsistencias = [];
              fechaInicio = null;
              fechaFin = null;
              subarrayId++;
            }
          } else {
            // Ignorar asistencias que no son "Asistió"
            if (contador > 0) {
              contador = 0;
              subAsistencias = [];
              fechaInicio = null;
              fechaFin = null;
            }
          }
        }
      }
    });


    if (asociacionData.length > 0) {
      const data = asociacionData.map((item) => {
        return {
          subarray_id: item.subArray_id,
          nombre: item.nombre,
          fecha_inicio: item.fecha_inicio,
          fecha_fin: item.fecha_fin,
          asistencia: item.asistencia,
          volquete: item.volquete,
          teletran: item.teletran ? item.teletran : 0,
          dias_laborados: item.asistencia,
          contrato_id: item.contrato_id,
          asociacion_id: item.asociacion_id
        };
      });

      for (const aprobacion of data) {
        await guardarAprobacion(aprobacion);
      }
    }
    if (aprobacionFilter.length > 0) {
      const data = aprobacionFilter.map((item) => {
        return {
          subarray_id: item.subArray_id,
          nombre: item.nombre,
          fecha_inicio: item.fecha_inicio,
          fecha_fin: item.fecha_fin,
          asistencia: item.asistencia,
          volquete: item.volquete,
          teletran: item.teletran ? item.teletran : 0,
          dias_laborados: item.asistencia,
          contrato_id: item.contrato_id,
          dni: item.dni
        };
      });

      for (const aprobacion of data) {
        await guardarAprobacion(aprobacion);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
async function guardarAprobacion(aprobacion) {
  const existingRecord = await aprobacion_contrato_pago.findOne({
    where: {
      subarray_id: aprobacion.subarray_id,
      contrato_id: aprobacion.contrato_id,
    },
  });

  if (!existingRecord) {
    await aprobacion_contrato_pago.create(aprobacion);
  }
}
const asociacionData = async () => {
  try {
    // Obtén todos los contratos activos
    const contratosActivos = await contrato.findAll({
      where: {
        asociacion_id: { [Op.not]: null },
        finalizado: false,
      },
      attributes: { exclude: ["contrato_id"] },
      include: [
        {
          model: asociacion,
          include: [
            {
              model: trabajador,
              order: [["codigo_trabajador", "ASC"]],
              attributes: { exclude: ["usuarioId"] },
              include: [
                {
                  model: trabajadorAsistencia,
                  attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
                  include: [{ model: asistencia }],
                },
                { model: evaluacion },
              ],
            },
          ],
        },
      ],
    });

    for (const contrato of contratosActivos) {
      let trabajadorAsistencias = contrato.asociacion.trabajadors.sort((a, b) =>
        a.codigo_trabajador.localeCompare(b.codigo_trabajador)
      )[0];

      let asistencias = trabajadorAsistencias.trabajador_asistencia; // Accede a las asistencias del trabajador
      let cantidadEstimada = 0;
      let cantidadReal = 0;
      let fechaEstimada = dayjs(contrato.fecha_estimada || contrato.fecha_fin);

      if (contrato.fecha_estimada) {
        // La fecha estimada ya ha sido establecida, entonces solo considerar las asistencias desde la última fecha estimada
        asistencias = asistencias.filter((asistencia) => {
          const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
          const fechaEstimada = dayjs(contrato.fecha_estimada);
          return (
            fechaAsistencia.isSame(fechaEstimada, "day") ||
            fechaAsistencia.isAfter(fechaEstimada, "day")
          );
        });
      } else {
        // La fecha estimada aún no ha sido establecida, entonces solo considerar las asistencias desde la fecha de inicio del contrato
        asistencias = asistencias.filter((asistencia) => {
          const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
          const fechaInicioContrato = dayjs(contrato.fecha_inicio);

          return (
            fechaAsistencia.isSame(fechaInicioContrato, "day") ||
            fechaAsistencia.isAfter(fechaInicioContrato, "day")
          );
        });
      }

      let faltas = 0;
      cantidadEstimada = contarDomingos(
        dayjs(contrato.fecha_inicio),
        dayjs(contrato.fecha_fin)
      );
      let domingosTrabajados = 0;
      asistencias.forEach((asistencia) => {
        // Cambiar a "asistencias"
        fechaAsistencia = dayjs(asistencia.asistencium.fecha);
        if (asistencia.revisada) {
          return; // Salir de este bucle y continuar con el siguiente
        }
        const estadoAsistencia = asistencia.asistencia;
        if (estadoAsistencia === "Asistio" || estadoAsistencia === "Comisión") {
          asistencia.update({ revisada: true });

          if (fechaAsistencia.day() === 0) {
            domingosTrabajados++;
          }
        } else {
          faltas++;
          cantidadEstimada++; // Incrementar cantidadEstimada por cada falta
          asistencia.update({ revisada: true });
        }
      });

      cantidadReal = calcularCantidadReal(asistencias); // Cambiar a "asistencias"
      fechaEstimada = dayjs(contrato.fecha_fin);
      fechaEstimada = fechaEstimada.subtract(domingosTrabajados, "day");
      for (let i = 0; i < faltas; i++) {
        fechaEstimada = fechaEstimada.add(1, "day");
        if (fechaEstimada.day() === 0) {
          // Si es domingo, agregar un día más
          fechaEstimada = fechaEstimada.add(1, "day");
        }
      }

      if (contrato.tareo === "Mes cerrado") {
        const fechaFinEstimada = dayjs(contrato.fecha_inicio).add(
          contrato.periodo_trabajo,
          "month"
        );
        const diasEnPeriodo = fechaFinEstimada.diff(
          dayjs(contrato.fecha_inicio),
          "day"
        );
        const domingosEnPeriodo = contarDomingos(
          dayjs(contrato.fecha_inicio),
          fechaFinEstimada
        );

        cantidadEstimada =
          (diasEnPeriodo - domingosEnPeriodo) * contrato.periodo_trabajo;
      } else if (contrato.tareo === "Lunes a sabado") {
        cantidadEstimada = 15 * contrato.periodo_trabajo;
      }

      if (cantidadReal >= cantidadEstimada) {
        await contrato.update({
          finalizado: true,
          fecha_fin: fechaEstimada.toDate(),
        });
        // Desligar trabajadores de la asociación y finalizar evaluaciones
        for (const trabajador of contrato.asociacion.trabajadors) {
          await trabajador.update({ asociacion_id: null });

          // Finalizar evaluaciones de trabajador
          for (const evaluacion of trabajador.evaluacions) {
            if (!evaluacion.finalizado) {
              await evaluacion.update({ finalizado: true });
            }
          }
        }
      } else {
        await contrato.update({
          fecha_fin: fechaEstimada.toDate(),
          fecha_fin_estimada: fechaEstimada.toDate(),
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};
const individual = async () => {
  try {
    // Obtén todos los contratos activos
    const contratosActivos = await contrato.findAll({
      where: {
        asociacion_id: null,
        finalizado: false,
      },
      attributes: { exclude: ["contrato_id"] },
      include: [
        {
          model: trabajador_contrato,
          include: [
            {
              model: trabajador,
              attributes: { exclude: ["usuarioId"] },
              include: [
                {
                  model: trabajadorAsistencia,
                  attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
                  include: [{ model: asistencia }],
                },
              ],
            },
          ],
        },
      ],
    });

    const updatePromises = [];
    for (const contrato of contratosActivos) {
      let trabajadorAsistencias =
        contrato.trabajador_contratos[0].trabajador.trabajador_asistencia;

      let cantidadEstimada = 0;
      let cantidadReal = 0;
      let fechaEstimada = dayjs(contrato.fecha_estimada || contrato.fecha_fin);

      if (contrato.fecha_estimada) {
        // La fecha estimada ya ha sido establecida, entonces solo considerar las asistencias desde la última fecha estimada
        trabajadorAsistencias = trabajadorAsistencias.filter((asistencia) => {
          const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
          const fechaEstimada = dayjs(contrato.fecha_estimada);
          return (
            fechaAsistencia.isSame(fechaEstimada, "day") ||
            fechaAsistencia.isAfter(fechaEstimada, "day")
          );
        });
      } else {
        // La fecha estimada aún no ha sido establecida, entonces solo considerar las asistencias desde la fecha de inicio del contrato
        trabajadorAsistencias = trabajadorAsistencias.filter((asistencia) => {
          const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
          const fechaInicioContrato = dayjs(contrato.fecha_inicio);

          return (
            fechaAsistencia.isSame(fechaInicioContrato, "day") ||
            fechaAsistencia.isAfter(fechaInicioContrato, "day")
          );
        });
      }

      let faltas = 0;
      cantidadEstimada = contarDomingos(
        dayjs(contrato.fecha_inicio),
        dayjs(contrato.fecha_fin)
      );
      let domingosTrabajados = 0;
      trabajadorAsistencias.forEach((asistencia) => {
        fechaAsistencia = dayjs(asistencia.asistencium.fecha);
        if (asistencia.revisada) {
          return; // Salir de este bucle y continuar con el siguiente
        }
        const estadoAsistencia = asistencia.asistencia;
        if (estadoAsistencia === "Asistio" || estadoAsistencia === "Comisión") {
          asistencia.update({ revisada: true });

          if (fechaAsistencia.day() === 0) {
            domingosTrabajados++;
          }
        } else {
          faltas++;
          cantidadEstimada++; // Incrementar cantidadEstimada por cada falta
          asistencia.update({ revisada: true });
        }
      });

      cantidadReal = calcularCantidadReal(trabajadorAsistencias);
      fechaEstimada = dayjs(contrato.fecha_fin);
      fechaEstimada = fechaEstimada.subtract(domingosTrabajados, "day");
      for (let i = 0; i < faltas; i++) {
        fechaEstimada = fechaEstimada.add(1, "day");
        if (fechaEstimada.day() === 0) {
          // Si es domingo, agregar un día más
          fechaEstimada = fechaEstimada.add(1, "day");
        }
      }

      if (contrato.tareo === "Mes cerrado") {
        const fechaFinEstimada = dayjs(contrato.fecha_inicio).add(
          contrato.periodo_trabajo,
          "month"
        );
        const diasEnPeriodo = fechaFinEstimada.diff(
          dayjs(contrato.fecha_inicio),
          "day"
        );
        const domingosEnPeriodo = contarDomingos(
          dayjs(contrato.fecha_inicio),
          fechaFinEstimada
        );

        cantidadEstimada =
          (diasEnPeriodo - domingosEnPeriodo) * contrato.periodo_trabajo;
      } else if (contrato.tareo === "Lunes a sabado") {
        cantidadEstimada = 15 * contrato.periodo_trabajo;
      }

      if (cantidadReal >= cantidadEstimada) {
        updatePromises.push(
          contrato.update({
            finalizado: true,
            fecha_fin: fechaEstimada.toDate(),
          })
        );
      } else {
        updatePromises.push(
          contrato.update({
            fecha_fin: fechaEstimada.toDate(),
            fecha_fin_estimada: fechaEstimada.toDate(),
          })
        );
      }
    }
    return await Promise.all(updatePromises);
  } catch (error) {
    console.error(error);
  }
};

const actulizarFechaFin = async (req, res, next) => {
  try {
    await getPlanillaAprobacion();
    await Promise.all([asociacionData(), individual()]);

    res.status(200).json({ msg: "Asistencias validadas con éxito!.", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo validar." });
  }
};

module.exports = { actulizarFechaFin };

// asociacion.start(); // Inicia la tarea
