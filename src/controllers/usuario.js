const { usuario } = require("../../config/db");

const getUsuario = async (req, res, next) => {
  try {
    const all = await usuario.findAll();
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getUsuarioById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const user = await usuario.findAll({ where: { id: id } });
    res.status(200).json({ data: user });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postUsuario = async (req, res, next) => {
  let info = {
    nombre: req.body.nombre,
    usuario: req.body.usuario,
    contrasenia: req.body.contrasenia,
    estado: req.body.estado,
  };
  try {
    const nuevoUsuario = await usuario.create(info);
    res.status(200).json({ data: nuevoUsuario });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateUsuario = async (req, res, next) => {
  let id = req.params.id;

  try {
    let user = await usuario.update(req.body, { where: { id: id } });
    res.status(200).json({ msg: "Usuario actualizado con éxito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteUsuario = async (req, res, next) => {
  let id = req.params.id;
  try {
    let user = await usuario.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Usuario eliminado con éxito", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: error, status: 500 });
  }
};

module.exports = {
  postUsuario,
  getUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuarioById,
};
