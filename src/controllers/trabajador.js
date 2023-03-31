require("dotenv").config;
const {
  trabajador,
  campamento,
  contrato,
  evaluacion,
  area,
  trabajador_contrato,
} = require("../../config/db");
const { Op, Sequelize } = require("sequelize");
const XLSX = require("xlsx");
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
      attributes: { exclude: ["usuarioId", "trabajador_dni"] },
      order: [[Sequelize.literal("codigo_trabajador"), "DESC"]],
      include: [
        {
          model: evaluacion,
        },
        {
          model: trabajador_contrato,
          attributes: { exclude: ["contrato_id"] },

          include: [
            {
              model: contrato,
              include: [{ model: area }],
              attributes: { exclude: ["contrato_id"] },
              include: [{ model: campamento }],
            },
          ],
        },
      ],
    });

    const obj = get
      .map((item) => {
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
          // contrato: item?.trabajador_contratos
          //   ?.map((data) => {
          //     return {
          //       id: data?.contrato?.id,
          //       fecha_inicio: data?.contrato?.fecha_inicio,
          //       codigo_contrato: data?.contrato?.codigo_contrato,
          //       tipo_contrato: data?.contrato?.tipo_contrato,
          //       periodo_trabajo: data?.contrato?.periodo_trabajo,
          //       fech_fin: data?.contrato?.fech_fin,
          //       gerencia: data?.contrato?.gerencia,
          //       area: data?.contrato?.area,
          //       jefe_directo: data?.contrato?.jefe,
          //       base: data?.contrato?.base,
          //       termino_contrato: data?.contrato?.termino_contrato,
          //       nota_contrato: data?.contrato?.nota_contrato,
          //       puesto: data?.contrato?.puesto,
          //       campamento_id: data?.contrato?.campamento_id,
          //       asociacion_id: data?.contrato?.asociacion_id,
          //       estado: data?.contrato?.estado,
          //       volquete: data?.contrato?.volquete,
          //       teletran: data?.contrato?.teletran,
          //       suspendido: data?.contrato?.suspendido,
          //       finalizado: data?.contrato?.finalizado,
          //       tareo: data?.contrato?.tareo,
          //       campamento: data?.contrato?.campamento?.nombre,
          //     };
          //   })
          //   .filter((item) => item?.finalizado === false),
        };
      })
      .sort((a, b) => a.codigo_trabajador.localeCompare(b.codigo_trabajador));
    return res.status(200).json({ data: obj });
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

    return res.status(200).json({ data: get });
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
      return res
        .status(200)
        .json({ msg: "Trabajador registrado con éxito!", status: 200 });
      next();
    } else if (filterRepeated.length > 0) {
      return res
        .status(200)
        .json({ msg: "El trabajador ya esta registrado.", status: 403 });
      next();
    } else {
      const nuevoTrabajador = await trabajador.create(info);
      return  res
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
    const getNumber = codigo_final.includes("CCMRL0000")
      ? codigo_final.split("CCMRL0000")[1]
      : codigo_final.includes("CCMRL000")
      ? codigo_final.split("CCMRL000")[1]
      : codigo_final.includes("CCMRL00")
      ? codigo_final.split("CCMRL00")[1]
      : codigo_final.includes("CCMRL0")
      ? codigo_final.split("CCMRL0")[1]
      : codigo_final.includes("CCMRL")
      ? codigo_final.split("CCMRL")[1]
      : "";
    const obj = result.map((item, i) => {
      return {
        dni: item?.dni,
        codigo_trabajador:
          parseInt(getNumber) + i + 1 < 10
            ? "CCMRL0000" + (parseInt(getNumber) + i + 1)
            : parseInt(getNumber) + i + 1 > 9 &&
              parseInt(getNumber) + i + 1 < 100
            ? "CCMRL000" + (parseInt(getNumber) + i + 1)
            : parseInt(getNumber) + i + 1 > 99 &&
              parseInt(getNumber) + i + 1 < 1000
            ? "CCMRL00" + (parseInt(getNumber) + i + 1)
            : parseInt(getNumber) + i + 1 > 99 &&
              parseInt(getNumber) + i + 1 < 1000
            ? "CCMRL0" + (parseInt(getNumber) + i + 1)
            : "CCMRL" + (parseInt(getNumber) + i + 1),
        fecha_nacimiento: dayjs(item?.fecha_nacimiento)?.format("YYYY-MM-DD"),
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

    const unique = obj.reduce((acc, current) => {
      if (!acc.find((ele) => ele.dni === current.dni)) {
        acc.push(current);
      }

      return acc;
    }, []);

    const getTrabajador = await trabajador.findAll({
      attributes: { exclude: ["usuarioId"] },
    });

    //filtrar a los trabajadores que ya estan registrados en la bd
    const filtered = unique.filter(
      ({ dni }) => !getTrabajador.some((x) => x.dni == dni)
    );

    //listado de dnis del excel
    const dnis = filtered.map((item) => item.dni);
    // filtrar
    const filterDni = filtered.filter(
      ({ dni }, index) => !dnis.includes(dni, index + 1)
    );

    if (filterDni.length !== 0) {
      const nuevoTrabajador = await trabajador.bulkCreate(filterDni);
      return res
        .status(200)
        .json({
          msg: `Se registraron ${filterDni.length} trabajadores con éxito!`,
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
    next();
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
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener", status: 500 });
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
  getLastId,
};
