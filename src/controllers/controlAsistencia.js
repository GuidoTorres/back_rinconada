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
const { format } = require("date-and-time");

function esPeriodoDeTrabajo(fecha, periodoTrabajo) {
  const fechaInicioPeriodo = new Date(periodoTrabajo.fecha_inicio);
  const fechaFinPeriodo = new Date(periodoTrabajo.fecha_fin);
  return fecha >= fechaInicioPeriodo && fecha <= fechaFinPeriodo;
}
const job = cron.schedule("06 13 * * *", async () => {
  try {
    // Obtén todos los contratos activos
    const contratosActivos = await contrato.findAll({
      where: {
        asociacion_id: null, // O asociacion_id = ''
        finalizado: false,
        fecha_fin: {
          [Op.gte]: new Date(), // La fecha fin debe ser mayor o igual a hoy
        },
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
    // Recorremos los contratos activos

    const prueba = contratosActivos.map((contratoActual) => {
      const trabajadorActual = contratoActual.trabajador_contratos.map(
        (data) => data.trabajador
      );
      const periodoTrabajo = contratoActual.periodo_trabajo;
      const asistencias = trabajadorActual.map((item) =>
        item.trabajador_asistencia.map((da) => da.asistencium.fecha).flat()
      );
      let fechaFinActualizada = contratoActual.fecha_fin;

      asistencias.map((asistenciaActual) => {
        const fechaAsistencia = asistenciaActual;
        const diaSemana = dayjs(fechaAsistencia).day();

        if (esPeriodoDeTrabajo(fechaAsistencia, periodoTrabajo)) {
          if (asistenciaActual.asistio === "Asistio") {
            // Si el trabajador asistió, no se modifica la fecha fin
          } else {
            // Si el trabajador no asistió, se aumenta o disminuye la fecha fin en un día
            fechaFinActualizada =
              asistenciaActual.asistio !== "Asistio"
                ? dayjs(fechaFinActualizada).subtract(1, "day")
                : dayjs(fechaFinActualizada).add(1, "day");

            // Si el día siguiente es domingo, se disminuye la fecha fin en un día
            if (diaSemana === 6) {
              fechaFinActualizada = dayjs(fechaFinActualizada).add(1, "day");
            }
          }
        } else {
          // Si la asistencia no corresponde al periodo de trabajo, no se modifica la fecha fin
        }
      });
      (contratoActual.fecha_fin = daysj(fechaFinActualizada)),
        format("YYYY-MM-DD");
      console.log(contratoActual);
      //   await contratoActual.save();
      //   console.log(fechaFinActualizada);
    });
  } catch (error) {
    console.error(error);
  }
});

job.start(); // Inicia la tarea
