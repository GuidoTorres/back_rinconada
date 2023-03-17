require("dotenv").config;
const { producto, unidad, categoria } = require("../../config/db");
const fs = require("fs");

const getProducto = async (req, res, next) => {
  try {
    const get = await producto.findAll({
      attributes: { exclude: ["categoria_id"] },
      include: [{ model: unidad }, { model: categoria }],
    });

    const formatData = get.map((item) => {
      return {
        id: item?.id,
        codigo: item?.codigo,
        codigo_interno: item?.codigo_interno,
        codigo_barras: item?.codigo_barras,
        descripcion: item?.descripcion,
        foto: item?.foto,
        almacen_id: item?.almacen_id,
        nombre: item?.nombre,
        stock: item?.stock,
        unidad_id: item?.unidad_id,
        precio: item?.precio,
        fecha: item?.fecha,
        observacion: item?.observacion,
        costo_total: item?.costo_total,
        categoria_id: item?.categorium?.id,
        categoria: item?.categorium?.descripcion,
      };
    });
    res.status(200).json({ data: formatData });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getProductoById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const getById = await producto.findAll({
      where: { id: id },
      attributes: { exclude: ["categoria_id"] },
    });
    res.status(200).json({ data: getById });
    next();
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const postProducto = async (req, res, next) => {
    let info = {
      almacen_id: req.body.almacen_id,
      categoria_id: req.body.categoria_id,
      codigo: req.body.codigo,
      codigo_barras: req.body.codigo_barras,
      codigo_interno: req.body.codigo_interno,
      costo_total: req.body.costo_total,
      descripcion: req.body.descripcion,
      fecha: req.body.fecha,
      nombre: req.body.nombre,
      observacion: req.body.observacion,
      precio: req.body.precio,
      stock: req.body.stock,
      unidad_id: req.body.unidad_id,
      foto: req?.file
        ? process.env.LOCAL_IMAGE + req.file.filename
        : "",
    };
  
  try {
    const post = await producto.create(info);
    res
      .status(200)
      .json({ msg: "Producto registrado con éxito!", status: 200 });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo crear el producto.", status: 500 });
  }
};

const updateProducto = async (req, res, next) => {
  let id = req.params.id;
  if (req.file && req?.body?.foto !== undefined && req.body.foto !== "" ) {
    const fileDir = require("path").resolve(__dirname, `./public/images/`);

    const editFotoLink = req?.body?.foto?.split("/").at(-1);
    fs.unlink("./public/images/" + editFotoLink, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("eliminado con éxito!");
      }
    });
  }

  let info = {
    almacen_id: req.body.almacen_id || "",
    categoria_id: req.body.categoria_id || null,
    codigo: req.body.codigo || "",
    codigo_barras: req.body.codigo_barras || "",
    codigo_interno: req.body.codigo_interno || "",
    costo_total: req.body.costo_total || "",
    descripcion: req.body.descripcion || "",
    fecha: req.body.fecha || "",
    nombre: req.body.nombre,
    observacion: req.body.observacion || "",
    precio: req.body.precio || "",
    stock: req.body.stock || "",
    unidad_id: req.body.unidad_id || null,
    foto: req?.file
      ? process.env.LOCAL_IMAGE + req.file.filename
      : req.body.foto,
  };

  try {
    let update = await producto.update(info, { where: { id: id } });
    res
      .status(200)
      .json({ msg: "Producto actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo actualizar el producto.", status: 500 });
  }
};

const deleteProducto = async (req, res, next) => {
  let id = req.params.id;
  try {
    console.log(id);
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
