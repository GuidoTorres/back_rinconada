const { producto } = require("../../config/db");

const getProducto = async (req, res, next) => {
  try {
    const get = await producto.findAll();
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getProductoById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const getById = await producto.findAll({
      where: { id: id },
    });
    res.status(200).json({ data: getById });
    next();
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const postProducto = async (req, res, next) => {
  console.log(req.body);
  try {
    const post = await producto.create(req.body);
    res.status(200).json({ msg: "Producto creado con éxito!", status: 200 });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo crear el producto.", status: 500 });
  }
};

const updateProducto = async (req, res, next) => {
  let id = req.params.id;

  try {
    let update = await producto.update(req.body, { where: { id: id } });
    res
      .status(200)
      .json({ msg: "Producto actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "No se pudo actualizar el producto.", status: 500 });
  }
};

const deleteProducto = async (req, res, next) => {
  let id = req.params.id;
  try {
    let camp = await producto.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Producto eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

module.exports = {
  getProducto,
  getProductoById,
  postProducto,
  updateProducto,
  deleteProducto,
};
