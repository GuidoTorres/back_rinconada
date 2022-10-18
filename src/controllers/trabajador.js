const { trabajador } = require("../../config/db");
const campamento = require("../../config/db");
const evaluacion = require("../../config/db");
const contrato = require("../../config/db");
const { Op } = require("sequelize");


const getTrabajador = async (req, res, next) => {
  try {
    const get = await trabajador.findAll({
      include: [
        {
          model: contrato.contrato,
          include: [{ model: campamento.campamento }],
        },
      ],
      where: {asociacion_id: {[Op.is]: null}}
    });
    const obj = get.map((obj) => {
      return {
        id: obj.id,
        dni: obj.dni,
        nombre:
          obj.nombre ,
        tipo_trabajador: obj.tipo_trabajador,
        contrato_id: obj?.contratos.map((item) => item?.id),
        campamento: obj?.contratos.map((item) => item?.campamento?.nombre),
        codigo_trabajador: obj.codigo_trabajador,
        fecha_nacimiento: obj.fecha_nacimiento,
        telefono: obj.telefono,
        apellido_paterno: obj.apellido_paterno,
        apellido_materno:   obj.apellido_materno,
        email: obj.email,
        estado_civil: obj.estado_civil,
        genero: obj.genero,
        direccion: obj.direccion

      };
    });
    console.log(obj);
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
      include: [{ model: contrato.contrato }],
      where: { trabajador_id: id },
    });

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
  };

  try {
    const nuevoTrabajador = await trabajador.create(info,{ignoreDuplicates: true});
    res.status(200).json(nuevoTrabajador);

    next();
  } catch (error) {
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
    res.status(500).json({ msg: error, status: 500 });
  }
};

module.exports = {
  getTrabajador,
  postTrabajador,
  updateTrabajador,
  deleteTrabajador,
  getTrabajadorById,
};
