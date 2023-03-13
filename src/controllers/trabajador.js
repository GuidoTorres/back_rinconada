require("dotenv").config;
const {
  trabajador,
  campamento,
  contrato,
  evaluacion,
  area,
} = require("../../config/db");
const { Op, Sequelize } = require("sequelize");
const XLSX = require("xlsx");
const sharp = require("sharp");
const dayjs = require("dayjs");
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
      attributes: { exclude: ["usuarioId"] },
      order: [[Sequelize.literal("codigo_trabajador"), "ASC"]],
      include: [
        {
          model: evaluacion,
        },
        {
          model: contrato,
          include: [{ model: area }],
          attributes: { exclude: ["contrato_id"] },
          include: [{ model: campamento }],
        },
      ],
    });

    const obj = get.map((item) => {
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
        evaluacion: item?.evaluacions.filter(
          (item) => item.finalizado === false
        ),
        campamento: !item?.contratos
          ?.filter((item) => item?.finalizado === false)
          ?.at(-1)?.campamento.nombre
          ? "Por asignar"
          : item?.contratos
              ?.filter((item) => item?.finalizado === false)
              ?.at(-1)?.campamento.nombre,
        contrato: item?.contratos.filter((item) => item?.finalizado === false),
      };
    });
    res.status(200).json({ data: obj });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getTrabajadorById = async (req, res, next) => {
  let id = req.params.id;
  try {
    const get = await trabajador.findAll({
      attributes: { exclude: ["usuarioId"] },
    });

    const obj = get.map((item) => {
      return {
        dni: item?.dni,
        codigo_trabajador: item?.codigo_trabajador,
        fecha_nacimiento: dayjs(item?.fecha_nacimiento).format("DD/MM/YYYY"),
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
      };
    });

    res.status(200).json({ data: obj });
    next();
  } catch (error) {
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
      res
        .status(200)
        .json({ msg: "Trabajador registrado con éxito!", status: 200 });
      next();
    } else if (filterRepeated.length > 0) {
      res
        .status(200)
        .json({ msg: "El trabajador ya esta registrado.", status: 403 });
      next();
    } else {
      const nuevoTrabajador = await trabajador.create(info);
      res
        .status(200)
        .json({ msg: "Trabajador registrado con éxito!", status: 200 });
      next();
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
      .slice(1)
      .map((v) =>
        Object.entries(v).reduce(
          (acc, [key, value]) =>
            Object.assign(acc, { [key.replace(/\s+/g, "_")]: value }),
          {}
        )
      );

    const getCodigoTrabajador = await trabajador.findOne({
      attributes: { exclude: ["usuarioId"] },
      order: [["codigo_trabajador", "DESC"]],
    });

    codigo_final = getCodigoTrabajador?.codigo_trabajador || "CCM000";
    const getNumber = codigo_final.includes("CCM00")
      ? codigo_final.split("CCM00")[1]
      : codigo_final.includes("CCM0")
      ? codigo_final.split("CCM0")[1]
      : codigo_final.includes("CCM")
      ? codigo_final.split("CCM")[1]
      : "";

    const obj = result.map((item, i) => {
      return {
        dni: parseInt(item?.dni),
        codigo_trabajador:
          parseInt(getNumber) + i + 1 < 10
            ? "CCM00" + (parseInt(getNumber) + i + 1)
            : parseInt(getNumber) + i + 1 >= 10 &&
              parseInt(getNumber) + i + 1 < 100
            ? "CCM0" + (parseInt(getNumber) + i + 1)
            : "CCM" + (parseInt(getNumber) + i + 1),
        fecha_nacimiento: dayjs(item?.fecha_nacimiento)?.format("YYYY-MM-DD"),
        telefono: item?.telefono,
        apellido_paterno: item?.apellido_paterno,
        apellido_materno: item?.apellido_materno,
        nombre: item?.nombre,
        email: item?.email,
        estado_civil: item?.estado_civil,
        genero: item?.genero,
      };
    });

    const getTrabajador = await trabajador.findAll({
      attributes: { exclude: ["usuarioId"] },
    });

    const filtered = obj.filter(
      ({ dni }) => !getTrabajador.some((x) => x.dni == dni)
    );

    const filteredCod = obj.filter(
      ({ codigo_trabajador }) =>
        !getTrabajador.some((x) => x.codigo_trabajador == codigo_trabajador)
    );

    const dnis = filteredCod.map((item) => item.dni);
    const cod_trabajador = filtered.map((item) => item.codigo_trabajador);

    const filterDni = filtered.filter(
      ({ dni }, index) => !dnis.includes(dni, index + 1)
    );

    if (dnis.length !== 0) {
      const nuevoTrabajador = await trabajador.bulkCreate(filterDni);
      res
        .status(200)
        .json({ msg: "Trabajadores registrados con éxito!", status: 200 });
    } else {
      res
        .status(200)
        .json({ msg: "Trabajadores actualmente registrados!", status: 200 });
    }

    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo registrar a los trabajadores", status: 500 });
  }
};

const updateTrabajador = async (req, res, next) => {
  let id = req.params.id;
  let info;
  if (req?.body?.foto !== undefined && req.body.foto !== "") {
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
    res
      .status(200)
      .json({ msg: "Trabajador actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
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
    res
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
    res
      .status(200)
      .json({ msg: "Trabajador eliminado con éxito", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: error, error: "No se pudo eliminar al trabajador" });
  }
};

module.exports = {
  getTrabajador,
  postTrabajador,
  updateTrabajador,
  deleteTrabajador,
  getTrabajadorById,
  postMultipleTrabajador,
  softDeleteTrabajador,
};
