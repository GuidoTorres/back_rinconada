const {
  contrato,
  trabajador,
  trabajadorAsistencia,
  trabajador_contrato,
  asistencia,
} = require("../../config/db");
const cron = require("node-cron");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

// Función para contar los domingos en un rango de fechas
function contarDomingos(inicio, fin) {
  let count = 0;
  let current = inicio.clone();

  while (current.isSameOrBefore(fin)) {
    if (current.day() === 0) {
      count++;
    }
    current = current.add(1, "day");
  }

  return count;
}

const individula = cron.schedule("26 09 * * *", async () => {
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
      console.log("real:", cantidadReal);
      console.log("estimada:", cantidadEstimada);
      console.log("Fecha estimada:", fechaEstimada.format("YYYY-MM-DD"));

      if (cantidadReal >= cantidadEstimada) {
        await contrato.update({
          finalizado: true,
          fecha_fin: fechaEstimada.toDate(),
        });
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
});

const asociacion = cron.schedule("26 09 * * *", async () => {
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
      console.log("real:", cantidadReal);
      console.log("estimada:", cantidadEstimada);
      console.log("Fecha estimada:", fechaEstimada.format("YYYY-MM-DD"));

      if (cantidadReal >= cantidadEstimada) {
        await contrato.update({
          finalizado: true,
          fecha_fin: fechaEstimada.toDate(),
        });
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
});

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

asociacion.start(); // Inicia la tarea
