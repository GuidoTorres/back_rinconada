const dayjs = require("dayjs");
const { Op } = require("sequelize");
const {
  aprobacion_contrato_pago,
  asociacion,
  trabajador,
  trabajadorAsistencia,
  asistencia,
  contrato,
  area,
  trabajador_contrato,
  cargo,
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

function convertDate(inputFormat) {
  const parts = inputFormat.split("-");
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

const aprobacionAsistencias = async (req, res, next) => {
  const { asociacion_id, dni, fecha_inicio, fecha_fin, quincena } = req.body;
  const inicioTrimmed = fecha_inicio.trim();
  const finTrimmed = fecha_fin.trim();
  // const finicio = parseDate(fecha_inicio, ['DD-MM-YYYY']);

  const inicio = convertDate(inicioTrimmed).toISOString().slice(0, 10);
  const fin = convertDate(finTrimmed).toISOString().slice(0, 10);

  try {
    if (asociacion_id !== null) {
      const asociacionAsistencia = await asociacion.findOne({
        where: { id: asociacion_id },

        include: [
          {
            model: contrato,
            attributes: { exclude: ["contrato_id"] },
            include: [{ model: aprobacion_contrato_pago, where:{subarray_id: quincena} }, { model: area }],
          },
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
                        [Op.between]: [inicio, fin],
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

      const contratoAsociacion = asociacionAsistencia.contratos
        .map((item) => item.area.nombre)
        .toString();

      const asistenciasObj = asociacionAsistencia?.trabajadors.map(
        (trabajador, index) => {
          // Crea un objeto con las mismas propiedades que el objeto del primer trabajador
          const obj = Object.assign({}, initialAsistenciasObj);

          const aprobaciones = asociacionAsistencia.contratos
            .map((item) => item.aprobacion_contrato_pagos)
            .flat();

          // Encuentra la aprobación correspondiente
          console.log(aprobaciones[0].firma_jefe);
          // Si se encuentra una aprobación correspondiente, agrega las propiedades al objeto
          if (aprobaciones) {
            obj.huella = aprobaciones.huella;
            obj.quincena = aprobaciones.subarray_id;
            obj.firma_jefe = aprobaciones.firma_jefe;
            obj.firma_gerente = aprobaciones.firma_gerente;
            obj.nro = index + 1;
            obj.dni = trabajador.dni;
            obj.telefono = trabajador.telefono;
            obj.asociacion = asociacionAsistencia.nombre;
            obj.cargo = asociacionAsistencia.tipo;
            obj.area = contratoAsociacion;
          } else {
            // Si no se encuentra una aprobación correspondiente, establece valores predeterminados para las propiedades
            obj.huella = "";
            obj.quincena = null;
            obj.firma_jefe = "";
            obj.firma_gerente = "";
            obj.nro = index + 1;
            obj.dni = trabajador.dni;
            obj.telefono = trabajador.telefono;
            obj.asociacion = asociacionAsistencia.nombre;
            obj.cargo = asociacionAsistencia.tipo;
            obj.area = contratoAsociacion;
          }

          // Si no es el primer trabajador, establece el valor predeterminado de todas las fechas a "NR" (no reconocido)
          if (index !== 0) {
            Object.keys(obj).forEach((fecha) => {
              if (
                fecha !== "nombres" &&
                fecha !== "asociacion" &&
                fecha !== "cargo" &&
                fecha !== "area" &&
                fecha !== "dni" &&
                fecha !== "telefono"
              ) {
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
          if (
            fecha !== "nombres" &&
            fecha !== "nro" &&
            fecha !== "asociacion" &&
            fecha !== "cargo" &&
            fecha !== "area" &&
            fecha !== "dni" &&
            fecha !== "telefono"
          ) {
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
    }
    if (dni !== null) {
      const trabajadorAsis = await trabajador.findOne({
        where: { dni: dni },
        attributes: { exclude: ["usuarioId"] },

        include: [
          {
            model: trabajador_contrato,
            include: [
              {
                model: contrato,
                attributes: { exclude: ["contrato_id"] },
                include: [
                  { model: aprobacion_contrato_pago },
                  { model: area },
                  { model: cargo, attributes: { exclude: ["cargo_id"] } },
                ],
              },
            ],
          },
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
                    [Op.between]: [inicio, fin],
                  },
                },
              },
            ],
          },
        ],
      });

      const initialAsistenciasObj = {};
      // Sobrescribe las asistencias del primer trabajador en el objeto
      trabajadorAsis?.trabajador_asistencia.forEach((item) => {
        const fecha = item.asistencium.fecha;
        initialAsistenciasObj[fecha] = item.asistencia;
      });
      const cargoNombre = trabajadorAsis.trabajador_contratos
        .map((item) => item.contrato.cargo.nombre)
        .toString();
      const areaNombre = trabajadorAsis.trabajador_contratos
        .map((item) => item.contrato.area.nombre)
        .toString();

      const asistenciasObj = [trabajadorAsis]?.map((trabajador, index) => {
        // Crea un objeto con las mismas propiedades que el objeto del primer trabajador
        const obj = Object.assign({}, initialAsistenciasObj);

        // Obtén las aprobaciones del contrato actual
        const aprobaciones = trabajador.trabajador_contratos
          .map((item) => item.contrato.aprobacion_contrato_pagos)
          .flat();
        console.log(aprobaciones);
        // Encuentra la aprobación correspondiente
        const aprobacion = aprobaciones.find(
          (aprob) => aprob.subarray_id == index + 1
        );
        // Si se encuentra una aprobación correspondiente, agrega las propiedades al objeto
        if (aprobacion) {
          obj.huella = aprobacion.huella;
          obj.quincena = aprobacion.subarray_id;
          obj.firma_jefe = aprobacion.firma_jefe;
          obj.firma_gerente = aprobacion.firma_gerente;
          obj.nro = index + 1;
          obj.nombres =
            trabajador?.apellido_paterno +
            " " +
            trabajador?.apellido_materno +
            " " +
            trabajador?.nombre;
          obj.dni = trabajador.dni;
          obj.telefono = trabajador.telefono;
          obj.cargo = cargoNombre;
          obj.area = areaNombre;
        } else {
          // Si no se encuentra una aprobación correspondiente, establece valores predeterminados para las propiedades
          obj.huella = "";
          obj.quincena = null;
          obj.firma_jefe = "";
          obj.firma_gerente = "";
          obj.nro = index + 1;
          obj.nombres =
            trabajador?.apellido_paterno +
            " " +
            trabajador?.apellido_materno +
            " " +
            trabajador?.nombre;
          obj.dni = trabajador.dni;
          obj.telefono = trabajador.telefono;
          obj.cargo = cargoNombre;
          obj.area = areaNombre;
        }

        // Si no es el primer trabajador, establece el valor predeterminado de todas las fechas a "NR" (no reconocido)
        if (index !== 0) {
          Object.keys(obj).forEach((fecha) => {
            if (
              fecha !== "nombres" &&
              fecha !== "cargo" &&
              fecha !== "area" &&
              fecha !== "dni" &&
              fecha !== "telefono" &&
              fecha !== "huella" &&
              fecha !== "quincena" &&
              fecha !== "firma_gerente" &&
              fecha !== "firm_jefe"
            ) {
              obj[fecha] = "";
            }
          });
        }

        //     // Sobrescribe las asistencias del trabajador actual, si las hay
        trabajador.trabajador_asistencia.forEach((item) => {
          const fecha = item.asistencium.fecha;
          obj[fecha] = item.asistencia;
        });

        return obj;
      });
      const prueba = asistenciasObj.map((asistencias) => {
        return Object.keys(asistencias).reduce((acc, fecha) => {
          if (
            fecha !== "nombres" &&
            fecha !== "nro" &&
            fecha !== "cargo" &&
            fecha !== "area" &&
            fecha !== "dni" &&
            fecha !== "telefono" &&
            fecha !== "huella" &&
            fecha !== "quincena" &&
            fecha !== "firma_gerente" &&
            fecha !== "firm_jefe"
          ) {
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
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener", status: 500 });
  }
};

module.exports = { getAprobacion, aprobacionAsistencias };
