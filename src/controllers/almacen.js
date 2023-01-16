const {
  almacen,
  producto,
  transferencia,
  almacen_transferencia,
  transferencia_producto,
  unidad,
  categoria,
} = require("../../config/db");

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
      attributes: { exclude: ["categoria_id"] },
      include:[{model:unidad}, {model:categoria}]
    });
    const formatData = get.map(item => {

      return{

        id: item.id,
        codigo: item.codigo,
        codigo_interno: item.codigo_interno,
        codigo_barras: item.codigo_barras,
        descripcion: item.descripcion,
        foto: item.foto,
        almacen_id: item.almacen_id,
        nombre: item.nombre,
        stock: item.stock,
        unidad_id: item.unidad_id,
        precio: item.precio,
        fecha: item.fecha,
        observacion: item.observacion,
        costo_total: item.costo_total,
        categoria_id: item.categorium.id,
        categoria: item.categorium.descripcion

      }

    })
    res.status(200).json({ data: formatData });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const almacenTrasferencia = async (req, res, next) => {
  let transferenciaFormat = {
    fecha: req.body[0].fecha,
    almacen_id: req.body[0].almacen_origen,
    almacen_origen: req.body[0].almacen_origen,
    almacen_destino: req.body[0].almacen_destino,
    estado_origen: false,
    estado_destino: false

  };

  let updateProductoOrigen = req.body.map((item) => {
    return {
      id: item.producto_origen,
      stock:
        item.stock_origen !== null
          ? parseInt(item.stock_origen) - parseInt(item.cantidad)
          : parseInt(item.cantidad),
    };
  });

  let updateProductoDestino = req.body.map((item) => {
    return {
      id: item.producto_destino,
      stock:
      item.stock_destino !== null
      ? parseInt(item.stock_destino) + parseInt(item.cantidad)
      : parseInt(item.cantidad),
    };
  });

  try {
    const postTransferencia = await transferencia.create(transferenciaFormat);

    let transferenciaAlmacen = req.body.map((item) => {
      return {
        producto_id: item.producto_origen,
        cantidad: item.cantidad,
        transferencia_id: postTransferencia.id,
      };
    });

    const postTransferenciaAlmacen = await transferencia_producto.bulkCreate(
      transferenciaAlmacen
    );

    let concat = updateProductoOrigen.concat(updateProductoDestino);


    const updateMultiple = await Promise.all(
      concat.map(
        async (item) =>
          await producto.update(
            { stock: item.stock },
            {
              where: { id: item.id },
            }
          )
      )
    );
    res
      .status(200)
      .json({ msg: "Transferencia realizada con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo realizar la transferencia.", status: 500 });
  }
};

module.exports = {
  getAlmacen,
  getAlmacenById,
  postAlmacen,
  updateAlmacen,
  deleteAlmacen,
  getProductsByAlmacen,
  almacenTrasferencia,
};
