const dayjs = require("dayjs");
const { Op } = require("sequelize");
const {
  aprobacion_contrato_pago,
  asociacion,
  trabajador,
  trabajadorAsistencia,
  asistencia,
  contrato,
} = require("../../config/db");
require("jspdf-autotable");

const getAprobacion = async (req, res, next) => {
  try {
    const all = await aprobacion_contrato_pago.findAll({});
    return res.status(200).json({ data: all });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const aprobacionAsistencias = async (req, res, next) => {
  const { asociacion_id, dni, fecha_inicio, fecha_fin } = req.body;
  try {
    if (asociacion_id !== null) {
      const asociacionAsistencia = await asociacion.findOne({
        where: { id: asociacion_id },

        include: [
          {model:contrato, attributes:{exclude:["contrato_id"]}},
          {
            model: trabajador,
            attributes: { exclude: ["usuarioId"] },
            include: [
              {
                model: trabajadorAsistencia,
                attributes: {
                  exclude: ["trabajador_dni", "trabajadorDni", "asistenciumId"],
                },
                include: [
                  {
                    model: asistencia,
                    where: {
                      fecha: {
                        [Op.between]: [
                          dayjs(fecha_inicio).format("YYYY-MM-DD"),
                          dayjs(fecha_fin).format("YYYY-MM-DD"),
                        ],
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      const firstTrabajador = asociacionAsistencia?.trabajadors[0];

      const initialAsistenciasObj = {};

      // Sobrescribe las asistencias del primer trabajador en el objeto
      firstTrabajador?.trabajador_asistencia.forEach((item) => {
        const fecha = item.asistencium.fecha;
        initialAsistenciasObj[fecha] = item.asistencia;
      });

      const asistenciasObj = asociacionAsistencia?.trabajadors.map(
        (trabajador, index) => {
          // Crea un objeto con las mismas propiedades que el objeto del primer trabajador
          const obj = Object.assign({}, initialAsistenciasObj);
          console.log(trabajador);
          obj.nro = index + 1;
          obj.nombres =
            trabajador?.apellido_paterno +
            " " +
            trabajador?.apellido_materno +
            " " +
            trabajador?.nombre;

          // Si no es el primer trabajador, establece el valor predeterminado de todas las fechas a "NR" (no reconocido)
          if (index !== 0) {
            Object.keys(obj).forEach((fecha) => {
              if (fecha !== "nombres") {
                obj[fecha] = "";
              }
            });
          }

          // Sobrescribe las asistencias del trabajador actual, si las hay
          trabajador.trabajador_asistencia.forEach((item) => {
            const fecha = item.asistencium.fecha;
            obj[fecha] = item.asistencia;
          });

          return obj;
        }
      );
      const prueba = asistenciasObj.map((asistencias) => {
        return Object.keys(asistencias).reduce((acc, fecha) => {
          if (fecha !== "nombres" && fecha !== "nro") {
            acc[fecha] =
              asistencias[fecha] === "Permiso"
                ? "P"
                : asistencias[fecha] === "Asistio"
                ? "X"
                : asistencias[fecha] === "Falto"
                ? "F"
                : asistencias[fecha] === "Dia libre"
                ? "DL"
                : asistencias[fecha] === "Comision"
                ? "C"
                : "";
          } else {
            acc[fecha] = asistencias[fecha];
          }
          return acc;
        }, {});
      });
      return res.status(200).json({ data: prueba, status: 200 });
    } else {
      const trabajadorAsis = await trabajador.findOne({
        where: { dni: dni },
        attributes: { exclude: ["usuarioId"] },

        include: [
          {
            model: trabajadorAsistencia,
            attributes: {
              exclude: ["trabajador_dni", "trabajadorDni", "asistenciumId"],
            },
            include: [
              {
                model: asistencia,
                where: {
                  fecha: {
                    [Op.between]: [
                      dayjs(fecha_inicio).format("YYYY-MM-DD"),
                      dayjs(fecha_fin).format("YYYY-MM-DD"),
                    ],
                  },
                },
              },
            ],
          },
        ],
      });

      const traba = trabajadorAsis?.trabajador_asistencia
        .map((item, i) => {
          return {
            id: i + 1,
            asistencia: item.asistencia,
            observacion: item.observacion,
            hora_ingreso: item.hora_ingreso,
            fecha: item.asistencium.fecha,
          };
        })
        .flat();
      return res.status(200).json({ data: traba, status: 200 });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener", status: 500 });
  }
};

module.exports = { getAprobacion, aprobacionAsistencias };
