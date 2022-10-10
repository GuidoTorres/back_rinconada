const { rolPuesto } = require("../../config/db");
// const cargo = require("../models/cargo");
const usuario = require("../../config/db");
const cargo = require("../../config/db");
const rol = require("../../config/db");

const getRol = async (req, res, next) => {
  try {
    const all = await rolPuesto.findAll({
      include:[
        {model: usuario.usuario},
        {model: cargo.cargo},
        {model: rol.rol}
      ] 
    });
    console.log(all);
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getRolById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const rolByID = await rolPuesto.findAll({ where: { id: id } });
    res.status(200).json({ data: rolByID });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postRol = async (req, res, next) => {
  let info = {
    //   nombre: req.body.nombre,
    usuario_id: req.body.usuario_id,
    cargo_id: req.body.cargo_id,
    rol_id: req.body.rol_id,
  };


  try {
    const createRol = await rolPuesto.create(info);
    console.log(createRol);
    res.status(200).json({ data: createRol });

    next();
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
};

const updateRol = async (req, res, next) => {
  let id = req.params.id;

  try {
    let upRol = await rolPuesto.update(req.body, { where: { id: id } });
    res.status(200).json({ msg: "Rol actualizado con exito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteRol = async (req, res, next) => {
  let id = req.params.id;
  try {
    let delRol = await rolPuesto.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Rol eliminado con exito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { getRol, getRolById, updateRol, deleteRol, postRol };
