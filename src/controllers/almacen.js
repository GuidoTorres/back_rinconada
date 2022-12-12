const { almacen, producto } = require("../../config/db");

const getAlmacen = async (req, res, next) => {
  try {
    const get = await almacen.findAll();
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getAlmacenById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const getById = await almacen.findAll({
      where: { id: id },
    });
    res.status(200).json({ data: getById });
    next();
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const postAlmacen = async (req, res, next) => {
  try {
    const post = await almacen.create(req.body);
    res.status(200).json({ msg: "Almacen creado con éxito!", status: 200 });

    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo crear el almacen.", status: 500 });
  }
};

const updateAlmacen = async (req, res, next) => {
  let id = req.params.id;

  try {
    let update = await almacen.update(req.body, { where: { id: id } });
    res
      .status(200)
      .json({ msg: "Almacen actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "No se pudo actualizar el almacen.", status: 500 });
  }
};

const deleteAlmacen = async (req, res, next) => {
  let id = req.params.id;
  try {
    let camp = await almacen.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Almacen eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};
const getProductsByAlmacen = async (req, res, next) => {
  let id = req.params.id;
  try {
    let get = await producto.findAll({
      where: { almacen_id: id },
    });
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getAlmacen,
  getAlmacenById,
  postAlmacen,
  updateAlmacen,
  deleteAlmacen,
  getProductsByAlmacen
};
