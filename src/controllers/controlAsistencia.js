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

const job = cron.schedule("21 09 * * *", async () => {
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
      console.log(trabajadorAsistencias);

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

      trabajadorAsistencias.forEach((asistencia) => {
        if (asistencia.considerado_en_estimacion) {
          return; // Salir de este bucle y continuar con el siguiente
        }

        const estadoAsistencia = asistencia.asistencia;

        if (estadoAsistencia === "Asistio" || estadoAsistencia === "Comisión") {
          cantidadReal++;
          asistencia.update({ considerado_en_estimacion: true });
        } else if (
          (estadoAsistencia === "Falto" &&
            fechaAsistencia.isSame(fechaEstimada, "day").add(1, "day")) ||
          fechaAsistencia.isAfter(fechaEstimada, "day").add(1, "day")
        ) {
          fechaEstimada = fechaEstimada.add(1, "day");
          asistencia.update({ considerado_en_estimacion: true });
        }
      });

      // Agregar faltas al cálculo de la fecha estimada
      let faltas = 0;
      trabajadorAsistencias.forEach((asistencia) => {
        if (asistencia.asistencia === "Falto") {
          faltas++;
        }
      });

      if (contrato.tareo === "mes cerrado") {
        const fechaFinEstimada = dayjs(contrato.fecha_inicio).add(
          contrato.periodo_trabajo,
          "month"
        );
        if (fechaFinEstimada.day() === 0) {
          fechaFinEstimada.add(1, "day");
        }
        const diasEnPeriodo = fechaFinEstimada.diff(
          dayjs(contrato.fecha_inicio),
          "day"
        );
        const domingosEnPeriodo = contarDomingos(
          dayjs(contrato.fecha_inicio),
          fechaFinEstimada
        );

        cantidadEstimada = diasEnPeriodo - domingosEnPeriodo;
      } else if (contrato.tareo === "quincena") {
        const diasEnPeriodo = 15 * contrato.periodo_trabajo;
        const fechaFinEstimada = dayjs(contrato.fecha_inicio).add(
          diasEnPeriodo,
          "day"
        );
        if (fechaFinEstimada.day() === 0) {
          fechaFinEstimada.add(1, "day");
        }
        const domingosEnPeriodo = contarDomingos(
          dayjs(contrato.fecha_inicio),
          fechaFinEstimada
        );

        cantidadEstimada = diasEnPeriodo - domingosEnPeriodo;
      }
      console.log(fechaEstimada);
      if (cantidadReal >= cantidadEstimada) {
        // El trabajador ha cumplido todas sus asistencias, entonces finalizar el contrato
        await contrato.update({
          finalizado: true,
          fecha_fin: fechaEstimada.toDate(),
        });
      } else {
        // El trabajador aún no ha cumplido todas sus asistencias, entonces actualizar la fecha estimada de finalización del contrato
        await contrato.update({ fecha_estimada: fechaEstimada.toDate() });
      }
    }
  } catch (error) {
    console.error(error);
  }
});

job.start(); // Inicia la tarea
