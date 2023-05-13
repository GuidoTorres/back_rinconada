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
  teletrans,
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
function obtenerFormaOrdinal(numero) {
  const ordinales = {
    1: "Primera",
    2: "Segunda",
    3: "Tercera",
    4: "Cuarta",
    5: "Quinta",
    6: "Sexta",
    7: "Séptima",
    8: "Octava",
    9: "Novena",
    10: "Décima",
    11: "Décima primera",
    // Agrega más números y sus ordinales aquí si es necesario
  };
  const formaOrdinal = ordinales[numero];
  if (formaOrdinal) {
    return formaOrdinal;
  } else {
    return numero + "ésima"; // Si no encuentra el número en el diccionario, retorna con la forma genérica "ésima"
  }
}
const obtenerRangoQuincena = (indice, fechaInicio, fechaFin) => {
  const ordinal = obtenerFormaOrdinal(indice);

  return `${ordinal} quincena de ${fechaInicio} - ${fechaFin}`;
};

const aprobacionAsistencias = async (req, res, next) => {
  const { asociacion_id, dni, fecha_inicio, fecha_fin, quincena, contrato_id } =
    req.body;
  const inicioTrimmed = fecha_inicio.trim();
  const finTrimmed = fecha_fin.trim();
  // const finicio = parseDate(fecha_inicio, ['DD-MM-YYYY']);
  console.log(contrato_id);
  const inicio = convertDate(inicioTrimmed).toISOString().slice(0, 10);
  const fin = convertDate(finTrimmed).toISOString().slice(0, 10);

  try {
    if (asociacion_id !== null) {
      const asocia =  asociacion.findOne({
        where: { id: asociacion_id },
        include: [
          {
            model: contrato,
            where: { id: contrato_id },
            attributes: { exclude: ["contrato_id"] },
            include: [
              {
                model: aprobacion_contrato_pago,
                where: { subarray_id: quincena },
              },
              { model: area },
              { model: teletrans },
            ],
          },
        ],
      });
      const trabaja = trabajador_contrato.findAll({
        where: { contrato_id: contrato_id },
        include: [
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

      const [asociacionAsistencia, trabajadorContratos] = await Promise.all([
        asocia,
        trabaja,
      ]);

      const dataContratos = asociacionAsistencia.contratos[0];

      const firstTrabajador = trabajadorContratos[0].trabajador;

      const aprobaciones = dataContratos.aprobacion_contrato_pagos[0];

      //   const pago = contratos?.teletrans[0]?.dataValues;
      const initialAsistenciasObj = {};
      // Sobrescribe las asistencias del primer trabajador en el objeto
      firstTrabajador?.dataValues?.trabajador_asistencia?.forEach((item) => {
        const fecha = item?.asistencium?.fecha;
        initialAsistenciasObj[fecha] = item?.asistencia;
      });

      const keys = Object.keys(initialAsistenciasObj);
      // Ordenar el array de claves según la fecha de manera ascendente
      keys.sort((a, b) => new Date(a) - new Date(b));
      // Crear un nuevo objeto para almacenar las claves ordenadas y sus valores correspondientes
      const sortedAsistenciasObj = {};
      keys.forEach((key) => {
        sortedAsistenciasObj[key] = initialAsistenciasObj[key];
      });

      const contratoAsociacion = dataContratos?.area?.nombre;
      const pago = dataContratos?.teletrans[0];

      const asistenciasObj = trabajadorContratos.map((trabajador, index) => {
        // Crea un objeto con las mismas propiedades que el objeto del primer trabajador
        const obj = Object.assign({}, initialAsistenciasObj);

        // Si se encuentra una aprobación correspondiente, agrega las propiedades al objeto
        if (aprobaciones) {
          obj.id = aprobaciones.id;
          obj.teletrans = pago?.teletran || 0;
          obj.volquetes = pago?.volquete || 0;
          obj.huella = aprobaciones.huella;
          obj.quincena = aprobaciones.subarray_id;
          obj.observaciones = aprobaciones.observaciones;
          obj.firma_jefe = aprobaciones.firma_jefe;
          obj.firma_gerente = aprobaciones.firma_gerente;
          obj.nro = index + 1;
          obj.textoQuincena = obtenerRangoQuincena(
            parseInt(aprobaciones.subarray_id),
            aprobaciones.fecha_inicio,
            aprobaciones.fecha_fin
          );
          obj.dni = trabajador?.trabajador?.dataValues?.dni;
          obj.telefono = trabajador?.trabajador?.dataValues?.telefono;
          obj.asociacion = asociacionAsistencia.nombre;
          obj.cargo = asociacionAsistencia.tipo;
          obj.area = contratoAsociacion;
          obj.nombres =
            trabajador?.trabajador?.dataValues?.apellido_paterno +
            " " +
            trabajador?.trabajador?.dataValues?.apellido_materno +
            " " +
            trabajador?.trabajador?.dataValues?.nombre;
        } else {
          // Si no se encuentra una aprobación correspondiente, establece valores predeterminados para las propiedades
          obj.huella = "";
          obj.id = "";
          obj.textoQuincea = "";
          obj.firma_jefe = "";
          obj.firma_gerente = "";
          obj.nro = index + 1;
          obj.observaciones = "";
          obj.textoQuincea = "";
          obj.dni = trabajador?.dataValues.dni;
          obj.telefono = trabajador?.dataValues.telefono;
          obj.asociacion = asociacionAsistencia.nombre;
          obj.cargo = asociacionAsistencia.tipo;
          obj.area = contratoAsociacion;
          obj.nombres =
            trabajador?.dataValues.apellido_paterno +
            " " +
            trabajador?.dataValues.apellido_materno +
            " " +
            trabajador?.dataValues.nombre;
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
              fecha !== "telefono" &&
              fecha !== "asociacion" &&
              fecha !== "quincena" &&
              fecha !== "huella" &&
              fecha !== "firma_jefe" &&
              fecha !== "firma_gerente" &&
              fecha !== "volquetes" &&
              fecha !== "teletrans" &&
              fecha !== "id" &&
              fecha !== "textoQuincena" &&
              fecha !== "observaciones"
            ) {
              obj[fecha] = "";
            }
          });
        }

        // Sobrescribe las asistencias del trabajador actual, si las hay
        trabajador?.trabajador?.dataValues?.trabajador_asistencia.forEach(
          (item) => {
            const fecha = item.asistencium.fecha;
            obj[fecha] = item.asistencia;
          }
        );
        return obj;
      });

      asistenciasObj.sort((a, b) => {
        const nameA = a.nombres.toUpperCase(); // Ignorar las diferencias entre mayúsculas y minúsculas
        const nameB = b.nombres.toUpperCase(); // Ignorar las diferencias entre mayúsculas y minúsculas

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      const prueba = asistenciasObj.map((asistencias) => {
        return Object.keys(asistencias).reduce((acc, fecha) => {
          if (
            fecha !== "nombres" &&
            fecha !== "nro" &&
            fecha !== "asociacion" &&
            fecha !== "cargo" &&
            fecha !== "area" &&
            fecha !== "dni" &&
            fecha !== "telefono" &&
            fecha !== "textoQuincena" &&
            fecha !== "huella" &&
            fecha !== "firma_jefe" &&
            fecha !== "firma_gerente" &&
            fecha !== "quincena" &&
            fecha !== "volquetes" &&
            fecha !== "teletrans" &&
            fecha !== "id" &&
            fecha !== "textoQuincena" &&
            fecha !== "observaciones"
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
                  {
                    model: aprobacion_contrato_pago,
                    where: { subarray_id: quincena },
                  },
                  { model: area },
                  { model: cargo, attributes: { exclude: ["cargo_id"] } },
                  { model: teletrans },
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
      const volquetesData = trabajadorAsis.trabajador_contratos
        .map((item) => item.contrato.teletrans[0].volquete)
        .toString();
      const teletransData = trabajadorAsis.trabajador_contratos
        .map((item) => item.contrato.teletrans[0].teletrans)
        .toString();

      const keys = Object.keys(initialAsistenciasObj);

      // Ordenar el array de claves según la fecha de manera ascendente
      keys.sort((a, b) => new Date(a) - new Date(b));

      // Crear un nuevo objeto para almacenar las claves ordenadas y sus valores correspondientes
      const sortedAsistenciasObj = {};

      keys.forEach((key) => {
        sortedAsistenciasObj[key] = initialAsistenciasObj[key];
      });

      const asistenciasObj = [trabajadorAsis]?.map((trabajador, index) => {
        // Crea un objeto con las mismas propiedades que el objeto del primer trabajador
        const obj = Object.assign({}, sortedAsistenciasObj);

        // Obtén las aprobaciones del contrato actual
        const aprobaciones = trabajador.trabajador_contratos
          .map((item) => item.contrato.aprobacion_contrato_pagos)
          .flat();
        // Si se encuentra una aprobación correspondiente, agrega las propiedades al objeto
        if (aprobaciones) {
          obj.huella = aprobaciones[0].dataValues.huella;
          obj.quincena = aprobaciones[0].dataValues.subarray_id;
          obj.textoQuincena = obtenerRangoQuincena(
            parseInt(aprobaciones[0].dataValues.subarray_id),
            aprobaciones[0].dataValues.fecha_inicio,
            aprobaciones[0].dataValues.fecha_fin
          );
          obj.observaciones = aprobaciones[0].dataValues.observaciones;
          obj.id = aprobaciones[0].dataValues.id;
          obj.teletrans = teletransData || 0;
          obj.volquetes = volquetesData || 0;
          obj.firma_jefe = aprobaciones[0].dataValues.firma_jefe;
          obj.firma_gerente = aprobaciones[0].dataValues.firma_gerente;
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
          obj.huella = null;
          obj.firma_jefe = null;
          obj.firma_gerente = null;
          obj.textoQuincea = null;
          obj.id = null;
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
          obj.observaciones = "";
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
              fecha !== "firm_jefe" &&
              fecha !== "textoQuincena" &&
              fecha !== "volquetes" &&
              fecha !== "teletrans" &&
              fecha !== "id" &&
              fecha !== "observaciones"
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
            fecha !== "firm_jefe" &&
            fecha !== "textoQuincena" &&
            fecha !== "volquetes" &&
            fecha !== "teletrans" &&
            fecha !== "id" &&
            fecha !== "observaciones"
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

const updateObservacion = async (req, res, next) => {
  let id = req.params.id;
  try {
    const post = await aprobacion_contrato_pago.update(
      { observaciones: req.body.observaciones },
      {
        where: { id: id },
      }
    );
    res
      .status(200)
      .json({ msg: "Observación guardada con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo registrar la observación.", status: 500 });
  }
};

module.exports = { getAprobacion, aprobacionAsistencias, updateObservacion };
