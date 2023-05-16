require("dotenv").config;
const {
  trabajador,
  campamento,
  contrato,
  evaluacion,
  area,
  trabajador_contrato,
  aprobacion_contrato_pago,
} = require("../../config/db");
const { Op, Sequelize } = require("sequelize");
const XLSX = require("xlsx");
const dayjs = require("dayjs");
require("dayjs/locale/es");
const fs = require("fs");

const getTrabajador = async (req, res, next) => {
  // trabajadores que no son de asociación
  try {
    const get = await trabajador.findAll({
      where: {
        [Op.and]: [
          { asociacion_id: { [Op.is]: null } },
          { eliminar: { [Op.not]: true } },
        ],
      },
      attributes: { exclude: ["usuarioId", "trabajador_dni"] },
      order: [[Sequelize.literal("codigo_trabajador"), "DESC"]],
      include: [
        {
          model: evaluacion,
          attributes: [
            "fiscalizador_aprobado",
            "control",
            "topico",
            "seguridad",
            "medio_ambiente",
            "recursos_humanos",
            "finalizado",
            "id",
          ],
        },
        {
          model: trabajador_contrato,
          attributes: { exclude: ["contrato_id"] },

          include: [
            {
              model: contrato,
              attributes: ["nota_contrato", "finalizado"],
              include: [{ model: area }],
              include: [
                {
                  model: campamento,
                  attributes: { exclude: ["campamento_id"] },
                },
              ],
            },
          ],
        },
      ],
    });

    const obj = get
      .map((item) => {
        const evaluacionActiva = item?.evaluacions.find(
          (item) => item.finalizado === false
        );

        return {
          dni: item?.dni,
          codigo_trabajador: item?.codigo_trabajador,
          fecha_nacimiento: item?.fecha_nacimiento,
          telefono: item?.telefono,
          nombre: item?.nombre,
          apellido_paterno: item?.apellido_paterno,
          apellido_materno: item?.apellido_materno,
          email: item?.email,
          estado_civil: item?.estado_civil,
          genero: item?.genero,
          direccion: item?.direccion,
          asociacion_id: item?.asociacion_id,
          deshabilitado: item?.deshabilitado,
          foto: item?.foto,
          eliminar: item?.eliminar,
          evaluacion: evaluacionActiva,
          contrato: item?.trabajador_contratos?.map((data) => {
            return {
              finalizado: data?.contrato?.finalizado,
              nota_contrato: data?.contrato?.nota_contrato,
              campamento: data?.contrato?.campamento?.nombre,
              id: data?.contrato?.id,
            };
          }),
        };
      })
      .sort((a, b) => {
        if (a.deshabilitado === b.deshabilitado) {
          return a.codigo_trabajador.localeCompare(b.codigo_trabajador);
        } else {
          return a.deshabilitado ? 1 : -1;
        }
      });
    return res.status(200).json({ data: obj });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};


const postTrabajador = async (req, res, next) => {
  let info;

  info = {
    dni: req?.body?.dni,
    codigo_trabajador: req?.body?.codigo_trabajador,
    fecha_nacimiento: req?.body?.fecha_nacimiento,
    telefono: req?.body?.telefono,
    apellido_paterno: req?.body?.apellido_paterno,
    apellido_materno: req?.body?.apellido_materno,
    nombre: req?.body?.nombre,
    email: req?.body?.email,
    estado_civil: req?.body?.estado_civil,
    genero: req?.body?.genero,
    direccion: req?.body?.direccion,
    tipo_trabajador: req?.body?.tipo_trabajador,
    foto: req.file ? process.env.LOCAL_IMAGE + req?.file?.filename : "",
  };

  try {
    const getTrabajador = await trabajador.findAll({
      raw: true,
      attributes: { exclude: ["usuarioId"] },
    });
    const filterRepeated = getTrabajador.filter((item) => item.dni == info.dni);
    const filterEliminado = getTrabajador.filter(
      (item) => item.dni == info.dni && item.eliminar === 1
    );

    if (filterEliminado.length > 0) {
      let actualizar = {
        eliminar: false,
      };
      const nuevoTrabajador = await trabajador.update(actualizar, {
        where: { dni: info.dni },
      });
      return res
        .status(200)
        .json({ msg: "Trabajador registrado con éxito!", status: 200 });
    } else if (filterRepeated.length > 0) {
      return res
        .status(200)
        .json({ msg: "El trabajador ya esta registrado.", status: 403 });
    } else {
      const nuevoTrabajador = await trabajador.create(info);
      return res
        .status(200)
        .json({ msg: "Trabajador registrado con éxito!", status: 200 });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo crear el trabajador.", status: 500 });
  }
};

const postMultipleTrabajador = async (req, res, next) => {
  try {
    const workbook = XLSX.readFile("./upload/data.xlsx");
    const workbookSheets = workbook.SheetNames;
    const sheet = workbookSheets[0];
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
    const result = dataExcel
      .map((v) =>
        Object.entries(v).reduce(
          (acc, [key, value]) =>
            Object.assign(acc, { [key.replace(/\s+/g, "_")]: value }),
          {}
        )
      )
      .filter((item) => !isNaN(item.dni) && item.dni.toString().length === 8);
    const getCodigoTrabajador = await trabajador.findOne({
      attributes: { exclude: ["usuarioId"] },
      order: [["codigo_trabajador", "DESC"]],
    });
    const codigo_final = getCodigoTrabajador?.codigo_trabajador || "CCMRL00000";

    const getNumber = codigo_final.match(/(\d+)$/)?.[1] || "00000";
    const obj = result.map((item, i) => {
      let fechaNacimiento;
      const fechaRegex = /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/;

      if (!isNaN(item.fecha_nacimiento)) {
        // Si la fecha es un número de serie
        const dateObj = XLSX.SSF.parse_date_code(item.fecha_nacimiento);
        fechaNacimiento = `${dateObj.y}-${dateObj.m
          .toString()
          .padStart(2, "0")}-${dateObj.d.toString().padStart(2, "0")}`;
      } else {
        // Si la fecha ya está en formato de fecha válido
        const match = item.fecha_nacimiento?.match(fechaRegex);
        if (match) {
          const year = match[3];
          const month = match[1].length === 1 ? `0${match[1]}` : match[1];
          const day = match[2].length === 1 ? `0${match[2]}` : match[2];
          fechaNacimiento = `${year}-${month}-${day}`;
        } else {
          const parsedDate = dayjs(item.fecha_nacimiento, [
            "DD/MM/YYYY",
            "D/MM/YYYY",
            "DD/M/YYYY",
            "D/M/YYYY",
            "MM/DD/YYYY",
            "M/DD/YYYY",
            "MM/D/YYYY",
            "M/D/YYYY",
            "YYYY-MM-DD",
            "YYYY/MM/DD",
            "YYYY/M/DD",
            "YYYY/MM/D",
            "YYYY/M/D",
            "DD-MM-YYYY",
            "D-MM-YYYY",
            "DD-M-YYYY",
            "D-M-YYYY",
            "MM-DD-YYYY",
            "M-DD-YYYY",
            "MM-D-YYYY",
            "M-D-YYYY",
          ]);
          if (parsedDate.isValid()) {
            fechaNacimiento = parsedDate.format("YYYY-MM-DD");
          } else {
            console.log(`La fecha ${item.fecha_nacimiento} es inválida`);
          }
        }
      }
      return {
        dni: item?.dni,
        codigo_trabajador: `CCMRL${(parseInt(getNumber) + i + 1)
          .toString()
          .padStart(5, "0")}`,
        fecha_nacimiento: fechaNacimiento,
        telefono: item?.telefono,
        apellido_paterno: item?.apellido_paterno,
        apellido_materno: item?.apellido_materno,
        nombre: item?.nombre,
        email: item?.email,
        estado_civil: item?.estado_civil,
        genero: item?.genero,
        direccion: item?.direccion,
      };
    });
    console.log(obj);

    const unique = obj.reduce((acc, current) => {
      if (!acc.find((ele) => ele.dni === current.dni)) {
        acc.push(current);
      }

      return acc;
    }, []);

    if (unique.length !== 0) {
      const nuevoTrabajador = await trabajador.bulkCreate(unique, {
        updateOnDuplicate: [
          "fecha_nacimiento",
          "telefono",
          "email",
          "apellido_paterno",
          "apellido_materno",
          "nombre",
          "email",
          "estado_civil",
          "direccion",
          "asociacion_id",
        ],
      });
      return res.status(200).json({
        msg: `Se registraron ${unique.length} trabajadores con éxito!`,
        status: 200,
      });
    } else {
      return res
        .status(500)
        .json({ msg: "No se pudo registrar a los trabajadores!", status: 500 });
    }

    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo registrar a los trabajadores.", status: 500 });
  }
};

const updateTrabajador = async (req, res, next) => {
  let id = req.params.id;
  let info;
  if (req.file && req?.body?.foto !== undefined && req.body.foto !== "") {
    const fileDir = require("path").resolve(__dirname, `./public/images/`);

    const editFotoLink = req.body.foto.split("/").at(-1);
    fs.unlink("./public/images/" + editFotoLink, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("eliminado con éxito!");
      }
    });
  }
  info = {
    dni: req.body.dni,
    codigo_trabajador: req.body.codigo_trabajador,
    fecha_nacimiento: req.body.fecha_nacimiento,
    telefono: req.body.telefono,
    apellido_paterno: req.body.apellido_paterno,
    apellido_materno: req.body.apellido_materno,
    nombre: req.body.nombre,
    email: req.body.email,
    estado_civil: req.body.estado_civil,
    genero: req.body.genero,
    direccion: req.body.direccion,
    tipo_trabajador: req.body.tipo_trabajador,
    asociacion_id: req.body.asociacion_id || null,
    deshabilitado: req.body.deshabilitado,
    foto: req.file
      ? process.env.LOCAL_IMAGE + req.file.filename
      : req.body.foto,
  };

  try {
    const putTrabajador = await trabajador.update(info, {
      where: { dni: id },
    });
    return res
      .status(200)
      .json({ msg: "Trabajador actualizado con éxito!", status: 200 });
  } catch (error) {

    res
      .status(500)
      .json({ msg: "No se pudo actualizar el trabajador.", status: 500 });
  }
};

const deleteTrabajador = async (req, res, next) => {
  let id = req.params.id;
  try {
    // let deleteEvaluacion = await evaluacion.destroy({where: {trabajador_id: id}})
    // let deleteContrato = await contrato.destroy({where : {trabajador_id: id}})
    let response = await trabajador.destroy({ where: { dni: id } });
    return res
      .status(200)
      .json({ msg: "Trabajador eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo eliminar el trabajador.", status: 500 });
  }
};

const softDeleteTrabajador = async (req, res, next) => {
  let id = req.params.id;
  try {
    let response = await trabajador.update(req.body, { where: { dni: id } });
    console.log(id);
    return res
      .status(200)
      .json({ msg: "Trabajador eliminado con éxito", status: 200 });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: error, error: "No se pudo eliminar al trabajador" });
  }
};

const getLastId = async (req, res, next) => {
  try {
    const get = await trabajador.findOne({
      attributes: {
        exclude: [
          "usuarioId",
          "eliminar",
          "foto",
          "asociacion_id",
          "deshabilitado",
          "direccion",
          "genero",
          "estado_civil",
          "email",
          "telefono",
          "fecha_nacimiento",
          "apellido_paterno",
          "apellido_materno",
          "nombre",
        ],
      },
      order: [["codigo_trabajador", "DESC"]],
    });
    res.status(200).json([get]);
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo obtener", status: 500 });
  }
};

const getTrabajadorPagoAprobado = async (req, res, next) => {
  try {
    const get = await trabajador.findAll({
      where: {
        [Op.and]: [
          { asociacion_id: { [Op.is]: null } },
          { deshabilitado: { [Op.not]: true } },
        ],
      },
      attributes: { exclude: ["usuarioId", "trabajador_dni"] },
      include: [
        {
          model: trabajador_contrato,
          attributes: { exclude: ["contrato_id"] },

          include: [
            {
              model: contrato,
              where: { finalizado: false, suspendido: false },
              attributes: { exclude: ["contrato_id"] },
              include: [
                {
                  model: aprobacion_contrato_pago,
                },
              ],
            },
          ],
        },
      ],
    });

    const filterContrato = get.filter(
      (item) => item?.trabajador_contratos.length > 0
    );

    const filterAprobacion = filterContrato
      .map((item) => {
        if (
          item.trabajador_contratos
            .at(-1)
            .contrato.aprobacion_contrato_pagos.filter(
              (item) => item.estado === true
            )
        ) {
          return {
            nombre:
              item?.apellido_paterno +
              " " +
              item?.apellido_materno +
              " " +
              item?.nombre,
            celular: item?.telefono,
            cargo: item?.trabajador_contratos.at(-1).contrato?.puesto,
            contrato_id: item?.trabajador_contratos.at(-1).contrato?.id,
            aprobacion: item.trabajador_contratos
              .at(-1)
              .contrato.aprobacion_contrato_pagos.filter(
                (item) =>
                  (item.estado === true && item.pagado === false) ||
                  item.pagado === null
              ),
          };
        }
      })
      .filter((item) => item.aprobacion.length > 0);

    res.status(200).json({ data: filterAprobacion });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "No se pudo obtener", status: 500 });
  }
};

module.exports = {
  getTrabajador,
  postTrabajador,
  updateTrabajador,
  deleteTrabajador,
  postMultipleTrabajador,
  softDeleteTrabajador,
  getLastId,
  getTrabajadorPagoAprobado,
};
