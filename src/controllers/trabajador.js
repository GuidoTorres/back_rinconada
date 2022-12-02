const {
  trabajador,
  campamento,
  contrato,
  evaluacion,
  contratoEvaluacion,
} = require("../../config/db");
const { Op } = require("sequelize");
const { cloudinary } = require("../../config/cloudinary");
const XLSX = require("xlsx");
const sharp = require("sharp");

const getTrabajador = async (req, res, next) => {
  // trabajadores que no son de asociación
  try {
    const get = await trabajador.findAll({
      where: { asociacion_id: { [Op.is]: null } },
      include: [
        {
          model: evaluacion,
          include: [
            {
              model: contratoEvaluacion,
              include: [
                {
                  model: contrato,
                  attributes: { exclude: ["contrato_id"] },
                  include: [{ model: campamento }],
                },
              ],
            },
          ],
        },
      ],
    });

    const obj = get.map((obj) => {
      let total = 0;
      let final;
      const notas = obj?.evaluacions.map((data) =>
        data?.contrato_evaluacions?.map((item) =>
          parseInt(item?.contrato?.nota_contrato)
        )
      );
      const notaFinal = notas?.filter((item) => item !== null);

      const nota = obj?.evaluacions.map((data) =>
        data?.contrato_evaluacions?.map((item) =>
          parseInt(item?.contrato?.nota_contrato)
        )
      );

      if (notas.length === 1) {
        final = notaFinal;
      } else if (notas.length > 0 && notas.length > 1) {
        final = nota.reduce((acc, value) => {
          const result = Math.floor(
            (parseInt(acc) + parseInt(value)) / notas.length
          );

          return result;
        });
      }

      return {
        id: obj?.id,
        campamento: obj?.evaluacions[
          obj.evaluacions.length - 1
        ]?.contrato_evaluacions
          ?.map((item) => item?.contrato?.campamento?.nombre)
          .toString(),

        nota: final,
        deshabilitado: obj?.deshabilitado,
        dni: obj?.dni,
        nombre: obj?.nombre,
        apellido_paterno: obj?.apellido_paterno,
        apellido_materno: obj?.apellido_materno,
        codigo_trabajador: obj?.codigo_trabajador,
        fecha_nacimiento: obj?.fecha_nacimiento,
        telefono: obj?.telefono,
        email: obj?.email,
        estado_civil: obj?.estado_civil,
        genero: obj?.genero,
        direccion: obj?.direccion,
        foto: obj?.foto,
        estado: obj.evaluacions
          ?.map((item) =>
            item?.contrato_evaluacions
              .map((dat) => [dat?.contrato]?.map((da) => da?.estado))
              .flat()
          )
          .flat(),
        contrato: obj?.evaluacions
          .map((item) =>
            item?.contrato_evaluacions?.map((dat) => dat?.contrato)
          )
          .flat(),
        evaluacion_id: obj?.evaluacions[obj.evaluacions.length - 1]?.id,
        contrato_finalizado: obj?.evaluacions
          .map(
            (item) =>
              item?.contrato_evaluacions[item.contrato_evaluacions.length - 1]
                ?.contrato?.finalizado
          )
          .toString(),
        evaluacion_finalizada:
          obj?.evaluacions[obj.evaluacions.length - 1]?.finalizado,
        fiscalizador:
          obj?.evaluacions[obj.evaluacions.length - 1]?.fiscalizador_aprobado,
        control: obj?.evaluacions[obj.evaluacions.length - 1]?.control,
        topico: obj?.evaluacions[obj.evaluacions.length - 1]?.topico,
        seguridad: obj?.evaluacions[obj.evaluacions.length - 1]?.seguridad,
        medio_ambiente:
          obj?.evaluacions[obj.evaluacions.length - 1]?.medio_ambiente,
        recursos_humanos:
          obj?.evaluacions[obj.evaluacions.length - 1]?.recursos_humanos,
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
    const get = await trabajador.findAll({});

    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const postTrabajador = async (req, res, next) => {
  let info;

  if (req.file) {
    const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: "ml_default",
      height: 80,
      width: 80,
    });
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
      foto: uploadResponse.url,
    };
  } else {
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
    };
  }

  try {
    const getTrabajador = await trabajador.findAll({
      raw: true,
    });
    const filterRepeated = getTrabajador.filter((item) => item.dni == info.dni);
    if (filterRepeated.length > 0) {
      res
        .status(200)
        .json({ msg: "El trabajador ya esta registrado.", status: 403 });
    } else {
      const nuevoTrabajador = await trabajador.create(info);
      res
        .status(200)
        .json({ msg: "Trabajador creado con exito!", status: 200 });
    }
    next();
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

    const obj = result.map((item) => {
      return {
        dni: parseInt(item.__EMPTY),
        codigo_trabajador: item.Tabla_1,
        fecha_nacimiento: item.__EMPTY_4,
        telefono: item.__EMPTY_5,
        apellido_paterno: item.__EMPTY_2,
        apellido_materno: item.__EMPTY_3,
        nombre: item.__EMPTY_1,
        email: item.__EMPTY_6,
        estado_civil: item.__EMPTY_7,
        genero: item.__EMPTY_8,
      };
    });

    const getTrabajador = await trabajador.findAll();
    const filtered = obj.filter(
      ({ dni, codigo_trabajador }) =>
        !getTrabajador.some((x) => x.dni == dni) && codigo_trabajador
    );

    const dnis = filtered.map((item) => item.dni);
    const filterDni = filtered.filter(
      ({ dni }, index) => !dnis.includes(dni, index + 1)
    );

    const nuevoTrabajador = await trabajador.bulkCreate(filterDni);
    res
      .status(200)
      .json({ msg: "Trabajadores creados con éxito!", status: 200 });

    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "No se pudo registrar a los trabajadores", status: 500 });
  }
};

const updateTrabajador = async (req, res, next) => {
  let id = req.params.id;
  let info;
  if (req.file) {
    const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: "ml_default",
      height: 120,
      width: 120,
    });
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
      foto: uploadResponse.url,
    };
  } else {
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
      asociacion_id: req.body.asociacion_id || null,
      tipo_trabajador: req.body.tipo_trabajador,
      deshabilitado: req.body.deshabilitado,
    };
  }

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
    let response = await trabajador.destroy({ where: { dni: id } });
    res
      .status(200)
      .json({ msg: "Trabajador eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "No se pudo eliminar el trabajador.", status: 500 });
  }
};

const softDeleteTrabajador = async (req, res, next) => {
  let id = req.params.id;
  try {
    let response = await trabajador.destroy({ where: { id: id } });
    res
      .status(200)
      .json({ msg: "Trabajador eliminado con éxito", status: 200 });
    next();
  } catch (error) {
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
};
