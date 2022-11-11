const {
  trabajador,
  campamento,
  contrato,
  evaluacion,
  contratoEvaluacion,
} = require("../../config/db");
const { Op } = require("sequelize");

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
      return {
        id: obj.id,
        campamento: obj.evaluacions
          .map((data) =>
            data.contrato_evaluacions.map((item) => item?.contrato?.campamento)
          )
          .flat(),
        nota: obj.evaluacions
          .map((data) =>
            data.contrato_evaluacions.map(
              (item) => item?.contrato?.nota_contrato
            )
          )
          .toString(),
        deshabilitado: obj.deshabilitado,
        dni: obj.dni,
        nombre: obj.nombre,
        apellido_paterno: obj.apellido_paterno,
        apellido_materno: obj.apellido_materno,
        codigo_trabajador: obj.codigo_trabajador,
        fecha_nacimiento: obj.fecha_nacimiento,
        telefono: obj.telefono,
        email: obj.email,
        estado_civil: obj.estado_civil,
        genero: obj.genero,
        direccion: obj.direccion,

        contrato: obj.evaluacions
          .map((item) => item.contrato_evaluacions.map((dat) => dat.contrato))
          .flat(),
        imc: obj.evaluacions.map((item) => item.imc).toString(),
        evaluacion_laboral: obj.evaluacions
          .map((item) => item.evaluacion_laboral)
          .toString(),
        temperatura: obj.evaluacions.map((item) => item.temperatura).toString(),
        pulso: obj.evaluacions.map((item) => item.pulso).toString(),
        capacitacion_gema: obj.evaluacions
          .map((item) => item.capacitacion_gema)
          .toString(),
        capacitacion_sso: obj.evaluacions
          .map((item) => item.capacitacion_sso)
          .toString(),
        evaluacion_id: obj.evaluacions.map((item) => item.id).toString(),
        aprobado: obj.evaluacions.map((item) => item.aprobado).toString(),
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
  let info = {
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
    foto: `https://rinconada.herokuapp.com/${req.file.path}`,
  };

  try {
    const getTrabajador = await trabajador.findAll({
      raw: true,
    });

    const filterRepeated = getTrabajador.filter(
      (item) => item.dni === info.dni
    );
    console.log(filterRepeated);
    if (filterRepeated.length > 0) {
      res.status(200).json({ data: "Trabajador ya existe" });
    } else {
      const nuevoTrabajador = await trabajador.create(info);
      res.status(200).json({ data: "Trabajador creado exitosamente" });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const updateTrabajador = async (req, res, next) => {
  let id = req.params.id;

  try {
    const putTrabajador = await trabajador.update(req.body, {
      where: { id: id },
    });
    res.status(200).json({ msg: "Trabajador actualizado con éxito" });
    next();
  } catch (error) {
    res.status(500).json({ msg: error, status: 500 });
  }
};

const deleteTrabajador = async (req, res, next) => {
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
};
