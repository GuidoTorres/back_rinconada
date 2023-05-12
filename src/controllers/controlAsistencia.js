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
  if (!trabajadorAsistencias) {
    return;
  }
  trabajadorAsistencias.forEach((asistencia) => {
    const estadoAsistencia = asistencia.asistencia;
    if (estadoAsistencia === "Asistio" || estadoAsistencia === "Comisión") {
      cantidadReal++;
    }
  });
  return cantidadReal;
}

// para crear las aprobaciones en base a las asistencias
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
                finalizado: false,
                suspendido: { [Op.not]: true },
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
          let fechaInicioData = dayjs(contrato.fecha_inicio).toDate();
          let fechaFinData = dayjs(contrato.fecha_fin_estimada).toDate() || dayjs(contrato.fecha_fin).toDate();

          let fechaInicio = dayjs(contrato.fecha_inicio);
          let fechaFin = dayjs(contrato.fecha_fin_estimada) || dayjs(contrato.fecha_fin);

          if (fechaInicioData.getTime() > fechaFinData.getTime()) {
            return [];
          }

          let subarrays = [];
          const contratoData = contrato;

          const trabajadores = contrato.trabajador_contratos.map(
            (tc) => tc.trabajador
          );
          const trabajadorMenorCodigo = trabajadores.reduce((prev, curr) => {
            return prev.codigo_trabajador < curr.codigo_trabajador
              ? prev
              : curr;
          });

          const asistencias =
            trabajadorMenorCodigo.trabajador_asistencia.filter((asistencia) => {
              const asistenciaFecha = dayjs(asistencia?.asistencium?.fecha, [
                "YYYY-MM-DD",
                "YYYY-MM-DD HH:mm:ss",
              ]);
              return (
                (asistenciaFecha.isSame(fechaInicio) ||
                  asistenciaFecha.isAfter(fechaInicio)) &&
                (asistenciaFecha.isSame(fechaFin) ||
                  asistenciaFecha.isBefore(fechaFin)) &&
                (asistencia.asistencia === "Asistio" ||
                  asistencia.asistencia === "Comisión")
              );
            });

          const asistencia = asistencias[0];

          let contadorAsistencias = 0;
          let subAsistencias = [];
          let fechaInicioSubarray = null;
          let fechaFinSubarray = null;
          let subarrayId = 1;
          let currentDate = dayjs(contrato.fecha_inicio);
          while (
            currentDate.isBefore(fechaFin) ||
            currentDate.isSame(fechaFin)
          ) {
            if (!asistencia) {
              currentDate = currentDate.add(1, "day");
              continue;
            }
            contadorAsistencias++;
            subAsistencias.push(asistencia);
            if (contadorAsistencias === 1) {
              fechaInicioSubarray = asistencia.asistencium.fecha;
            }
            if (contadorAsistencias === 15) {
              fechaFinSubarray = asistencia.asistencium.fecha;

              subarrays.push({
                subArray_id: subarrayId,
                asociacion_id: asociacion?.id,
                nombre: asociacion?.nombre,
                fecha_inicio: dayjs(fechaInicioSubarray)?.format("DD-MM-YYYY"),
                fecha_fin: dayjs(fechaFinSubarray)?.format("DD-MM-YYYY"),
                asistencia: contadorAsistencias,
                volquete: contratoData?.teletrans?.at(-1)?.volquete,
                teletran: contratoData?.teletrans?.at(-1)?.teletran,
                total: contratoData?.teletrans?.at(-1)?.saldo,
                contrato_id: contratoData?.id,
                estado: contratoData?.aprobacion_contrato_pagos
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

              contadorAsistencias = 0;
              subAsistencias = [];
              fechaInicioSubarray = null;
              fechaFinSubarray = null;
              subarrayId++;
            }
          }

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
    const subarrayIdsPorTrabajador = {};
    filterContrato.forEach((trabajador) => {
      const contrato = trabajador.trabajador_contratos[0].contrato;
      const fechaInicioContrato = new Date(contrato.fecha_inicio);

      const asistencias = trabajador?.trabajador_asistencia
        ?.filter(
          (asistencia) =>
            (asistencia.asistencia === "Asistio" ||
              asistencia.asistencia === "Comisión") &&
            (dayjs(asistencia.asistencium.fecha).isSame(
              contrato.fecha_inicio
            ) ||
              dayjs(asistencia.asistencium.fecha).isAfter(
                contrato.fecha_inicio
              ))
        )
        .sort(
          (a, b) =>
            new Date(a.asistencium.fecha) - new Date(b.asistencium.fecha)
        );

      const numAsistencias = asistencias?.length;
      if (numAsistencias >= 15) {
        let contador = 0;
        let subAsistencias = [];
        let fechaInicio = null;
        let fechaFin = null;
        let currentDate = fechaInicioContrato;

        while (currentDate.isBefore(dayjs())) {
          const asistencia = asistencias.find((asistencia) => {
            const asistenciaFecha = dayjs(asistencia.asistencium.fecha);
            return asistenciaFecha.isSame(currentDate, "day");
          });

          if (!asistencia) {
            currentDate = currentDate.add(1, "day");
            continue;
          }
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

              if (!subarrayIdsPorTrabajador.hasOwnProperty(trabajador.dni)) {
                subarrayIdsPorTrabajador[trabajador.dni] = 1;
              } else {
                subarrayIdsPorTrabajador[trabajador.dni]++;
              }
              if (contrato.tipo_contrato !== "Planilla") {
                aprobacionFilter.push({
                  subArray_id: subarrayIdsPorTrabajador[trabajador.dni],
                  dni: trabajador.dni,
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
                    trabajador.trabajador_contratos[0].contrato?.teletrans?.at(
                      -1
                    )?.volquete,
                  teletran:
                    trabajador.trabajador_contratos[0].contrato?.teletrans?.at(
                      -1
                    )?.teletrans,
                  total:
                    trabajador.trabajador_contratos[0].contrato?.teletrans?.at(
                      -1
                    )?.total,
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
              }

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

    console.log(asociacionData);
    // if (asociacionData.length > 0) {
    //   const data = asociacionData.map((item) => {
    //     return {
    //       subarray_id: item.subArray_id,
    //       nombre: item.nombre,
    //       fecha_inicio: item.fecha_inicio,
    //       fecha_fin: item.fecha_fin,
    //       asistencia: item.asistencia,
    //       volquete: item.volquete,
    //       teletran: item.teletran ? item.teletran : 0,
    //       dias_laborados: item.asistencia,
    //       contrato_id: item.contrato_id,
    //       asociacion_id: item.asociacion_id,
    //     };
    //   });

    //   for (const aprobacion of data) {
    //     await guardarAprobacion(aprobacion);
    //   }
    // }
    // if (aprobacionFilter.length > 0) {
    //   const data = aprobacionFilter.map((item) => {
    //     return {
    //       subarray_id: item.subArray_id,
    //       nombre: item.nombre,
    //       fecha_inicio: item.fecha_inicio,
    //       fecha_fin: item.fecha_fin,
    //       asistencia: item.asistencia,
    //       volquete: item.volquete,
    //       teletran: item.teletran ? item.teletran : 0,
    //       dias_laborados: item.asistencia,
    //       contrato_id: item.contrato_id,
    //       dni: item.dni,
    //     };
    //   });

    //   for (const aprobacion of data) {
    //     await guardarAprobacion(aprobacion);
    //   }
    // }
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

//Para finalizar los contratos de las asocaciones si se completan las asistencias
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

      let asistencias = trabajadorAsistencias.trabajador_asistencia.sort(
        (a, b) => new Date(a.asistencium.fecha) - new Date(b.asistencium.fecha)
      ); // Accede a las asistencias del trabajador
      let cantidadEstimada = 0;
      let cantidadReal = 0;
      let fechaEstimada = dayjs(contrato.fecha_fin);
      let fechaFinal =
        dayjs(contrato.fecha_fin_estimada) || dayjs(contrato.fecha_fin);



        // La fecha estimada aún no ha sido establecida, entonces solo considerar las asistencias desde la fecha de inicio del contrato
        asistencias = asistencias.filter((asistencia) => {
          const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
          const fechaInicioContrato = dayjs(contrato.fecha_inicio);
          const fechaFinContrato =
            dayjs(contrato.fecha_fin_estimada) || dayjs(contrato.fecha_fin);

          return (
            fechaAsistencia.isSame(fechaInicioContrato, "day") ||
            (fechaAsistencia.isAfter(fechaInicioContrato, "day") &&
              fechaAsistencia.isSame(fechaFinContrato, "day")) ||
            fechaAsistencia.isBefore(fechaFinContrato, "day")
          );
        })
      // Llama a la función calculateEstimatedDate con los argumentos correspondientes.
      if (asistencias && asistencias.length > 0 && asistencias[asistencias.length - 1].asistencium && asistencias[asistencias.length - 1].asistencium.fecha) {
        let result = calculateEstimatedDate(

          dayjs(asistencias[asistencias.length - 1].asistencium.fecha),
          fechaEstimada,
          dayjs(contrato.fecha_inicio),
          asistencias
        );
        // Actualiza la fecha estimada con el resultado.
        fechaEstimada = result.estimatedDate;
      }
      // Calcula la cantidad real basándose en las asistencias.
      cantidadReal = calcularCantidadReal(asistencias);

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
          // fecha_fin: fechaEstimada.toDate(),
          fecha_fin_estimada: fechaEstimada.toDate(),
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};
//Para finalizar los contratos de las trabajadores individuales si se completan las asistencias
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
                { model: evaluacion },
              ],
            },
          ],
        },
      ],
    });
    let currentEstimatedDate = dayjs();
    const updatePromises = [];
    for (const contrato of contratosActivos) {
      let trabajadorAsistencias =
        contrato?.trabajador_contratos[0]?.trabajador?.trabajador_asistencia;
      let cantidadEstimada = 0;
      let cantidadReal = 0;
      let fechaEstimada = dayjs(contrato.fecha_fin);
      let contractStartDate = dayjs(contrato.fecha_inicio);
      let fechaFinal = dayjs(contrato.fecha_estimada || contrato.fecha_fin);

      trabajadorAsistencias.sort(
        (a, b) => new Date(a.asistencium.fecha) - new Date(b.asistencium.fecha)
      );
      let asistencia;

      asistencia = trabajadorAsistencias.filter((asistencia) => {
        const fechaAsistencia = dayjs(asistencia.asistencium.fecha);
        const fechaInicioContrato = dayjs(contrato.fecha_inicio);
        const fechaFinContrato =
          dayjs(contrato.fecha_fin_estimada) || dayjs(contrato.fecha_fin);

        return (
          fechaAsistencia.isSame(fechaInicioContrato, "day") ||
          (fechaAsistencia.isAfter(fechaInicioContrato, "day") &&
            fechaAsistencia.isSame(fechaFinContrato, "day")) ||
          fechaAsistencia.isBefore(fechaFinContrato, "day")
        );
      });

      if (asistencia.length > 0) {
        // Call the calculateEstimatedDate function with the last attendance object, the current estimated date, the contract start date, and the worker attendances array.
        let result = calculateEstimatedDate(
          dayjs(asistencia[asistencia.length - 1].asistencium.fecha),
          fechaEstimada,
          contractStartDate,
          trabajadorAsistencias
        );
        // Update the current estimated date with the result.
        fechaEstimada = result.estimatedDate;
        // Calculate the real quantity based on the worker attendances.
        cantidadReal = calcularCantidadReal(asistencia);
      }

      // Check the tareo type of the contract and calculate the estimated quantity accordingly.
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
        cantidadEstimada = diasEnPeriodo - domingosEnPeriodo;
      } else if (contrato.tareo === "Lunes a sabado") {
        cantidadEstimada = 15 * parseInt(contrato.periodo_trabajo);
      }

      // Check if the real quantity is greater than or equal to the estimated quantity and update the contract accordingly.
      if (cantidadReal >= cantidadEstimada) {
        const contratoUpdatePromise = contrato.update({
          finalizado: true,
          fecha_fin: fechaEstimada.toDate(),
          fecha_fin_estimada: fechaEstimada.toDate(),
        });
        updatePromises.push(contratoUpdatePromise);

        // Finalizamos la evaluacion activa del trabajador, si existe
        const trabajadorEvaluacion =
          contrato?.trabajador_contratos[0]?.trabajador.evaluacions[0];
        if (trabajadorEvaluacion) {
          const evaluacionUpdatePromise = trabajadorEvaluacion.update({
            finalizado: true,
          });
          updatePromises.push(evaluacionUpdatePromise);
        }
      } else {
        const contratoUpdatePromise = contrato.update({
          fecha_fin_estimada: fechaEstimada.toDate(),
        });
        updatePromises.push(contratoUpdatePromise);
      }

      return await Promise.all(updatePromises);
    }
    // Return a promise that resolves when all the update promises are fulfilled.
  } catch (error) {
    console.error(error);
  }
};

function calculateEstimatedDate(
  attendance,
  estimatedDate,
  contractStartDate,
  workerAttendances
) {
  // Obtiene la fecha de la última asistencia registrada como un objeto dayjs.
  let lastAttendanceDate = attendance;
  // Inicializa una variable para llevar la cuenta de los días que hay que añadir o restar a la fecha de finalización.
  let daysToAdd = 0;
  // Recorre todos los días entre la fecha de inicio del contrato y la fecha de la última asistencia registrada.
  for (
    let currentDate = contractStartDate;
    currentDate.isBefore(lastAttendanceDate) ||
    currentDate.isSame(lastAttendanceDate);
    currentDate = currentDate.add(1, "day")
  ) {
    // Comprueba si hay algún elemento en el array workerAttendances que coincida con la fecha actual.
    let hasRecord = workerAttendances.some(
      (a) => a.asistencium.fecha === currentDate.format("YYYY-MM-DD")
    );
    // Si no lo hay, y no es un domingo (suponiendo que los domingos no son días laborables), incrementa la variable daysToAdd en uno.
    if (!hasRecord && currentDate.day() !== 0) {
      daysToAdd++;
    }
    console.log(currentDate);
    console.log(hasRecord);

    let hasAttendance = workerAttendances.some(
      (a) =>
        a.asistencia !== "Asistio" &&
        a.asistencia !== "Comisión" &&
        a.asistencium.fecha === currentDate.format("YYYY-MM-DD")
    );
    if (hasAttendance && currentDate.day() !== 0) {
      daysToAdd++;
    }

    let hasAttendanceOnSunday = workerAttendances.some(
      (a) =>
        (a.asistencia === "Asistio" || a.asistencia === "Comisión") &&
        a.asistencium.fecha === currentDate.format("YYYY-MM-DD") &&
        currentDate.day() === 0
    );

    if (hasAttendanceOnSunday) {
      daysToAdd--;
    }
  }
  console.log(daysToAdd);
  // Añade los daysToAdd a la estimatedDate para obtener la nueva fecha estimada de finalización.
  estimatedDate = estimatedDate.add(daysToAdd, "day");
  console.log(estimatedDate);
  // Devuelve un objeto con la nueva fecha estimada.
  return { estimatedDate };
}

const actulizarFechaFin = async (req, res, next) => {
  try {
    // await getPlanillaAprobacion();
    await Promise.all([asociacionData(), individual()]);

    res
      .status(200)
      .json({ msg: "Asistencias validadas con éxito!.", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo validar." });
  }
};

module.exports = { actulizarFechaFin };

// asociacion.start(); // Inicia la tarea
