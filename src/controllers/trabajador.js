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
        campamento: obj?.evaluacions
          ?.map((data) =>
            data?.contrato_evaluacions?.map(
              (item) => item?.contrato?.campamento
            )
          )
          .flat(),
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
        imc: obj?.evaluacions.map((item) => item?.imc).toString(),
        evaluacion_laboral: obj?.evaluacions
          .map((item) => item?.evaluacion_laboral)
          .toString(),
        temperatura: obj?.evaluacions
          .map((item) => item?.temperatura)
          .toString(),
        pulso: obj?.evaluacions.map((item) => item?.pulso).toString(),
        capacitacion_gema: obj?.evaluacions
          ?.map((item) => item?.capacitacion_gema)
          .toString(),
        capacitacion_sso: obj?.evaluacions
          ?.map((item) => item?.capacitacion_sso)
          .toString(),
        evaluacion_id: obj?.evaluacions?.map((item) => item?.id).toString(),
        aprobado: obj?.evaluacions?.map((item) => item?.aprobado).toString(),
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

    const obj = dataExcel.map((item) => {
      return {
        dni: item.Dni,
        codigo_trabajador: item.codigo_trabajador,
        fecha_nacimiento: item.fecha_nacimiento,
        telefono: item.telefono,
        apellido_paterno: item.apellido_paterno,
        apellido_materno: item.apellido_materno,
        nombre: item.nombre,
        email: item.Email,
        estado_civil: item.estado_civil,
        genero: item.Genero,
      };
    });
    const getTrabajador = await trabajador.findAll();
    const filtered = obj.filter(
      ({ dni, codigo_trabajador }) =>
        !getTrabajador.some((x) => x.dni == dni) && codigo_trabajador
    );

    const nuevoTrabajador = await trabajador.bulkCreate(filtered);
    res.status(200).json({ data: "Trabajadores creados con éxito!" });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
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
