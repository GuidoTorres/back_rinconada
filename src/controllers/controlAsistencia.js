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

function esPeriodoDeTrabajo(fecha, periodoTrabajo) {
  const fechaInicioPeriodo = dayjs(periodoTrabajo.fecha_inicio, [
    "YYYY-MM-DD",
    "YYYY-MM-DD HH:mm:ss",
  ]).format("YYYY-MM-DD");
  const fechaFinPeriodo = dayjs(periodoTrabajo.fecha_fin, [
    "YYYY-MM-DD",
    "YYYY-MM-DD HH:mm:ss",
  ]).format("YYYY-MM-DD");
  return (
    dayjs(fecha).isAfter(fechaInicioPeriodo) &&
    dayjs(fecha).isBefore(fechaFinPeriodo)
  );
}
const job = cron.schedule("45 21 * * *", async () => {
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
      const periodoTrabajo = contratoActual.fecha_inicio;
      const asistencias = trabajadorActual.map((item) =>
        item.trabajador_asistencia.map((da) => da.asistencium.fecha).flat()
      );
      let fechaFinActualizada = contratoActual.fecha_fin;

      asistencias.map((asistenciaActual) => {
        const fechaAsistencia = asistenciaActual;
        const diaSemana = dayjs(fechaAsistencia).day();

        if (esPeriodoDeTrabajo(fechaAsistencia, contratoActual)) {
          console.log(fechaFinActualizada);
          fechaFinActualizada =
            asistenciaActual.asistio === "Asistio"
              ? dayjs(fechaFinActualizada).format("YYYY-MM-DD")
              : dayjs(fechaFinActualizada).add(1, "day").format("YYYY-MM-DD");
              console.log(fechaFinActualizada)
          if (diaSemana === 6) {
            fechaFinActualizada = dayjs(fechaFinActualizada)
              .add(1, "day")
              .format("YYYY-MM-DD");
          }
        }
      });
      contratoActual.fecha_fin =
        dayjs(fechaFinActualizada).format("YYYY-MM-DD");
      // console.log(contratoActual);
      //   await contratoActual.save();
      //   console.log(fechaFinActualizada);
    });
  } catch (error) {
    console.error(error);
  }
});

job.start(); // Inicia la tarea
