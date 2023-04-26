const {
  contrato,
  trabajador,
  trabajadorAsistencia,
  trabajador_contrato,
  asistencia,
  asociacion,
  evaluacion,
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
    await Promise.all([asociacionData(), individual()]);

    res.status(200).json({ msg: "Validado con éxito!.", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo validar." });
  }
};

module.exports = { actulizarFechaFin };

// asociacion.start(); // Inicia la tarea
