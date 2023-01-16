const {
  entrada_salida,
  producto,
  producto_entrada_salida,
} = require("../../config/db");

const getEntradaSalida = async (req, res, next) => {
  try {
    const all = await entrada_salida.findAll();
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getEntradaByAlmacen = async (req, res, next) => {
  let id = req.params.id;
  let tipo = req.query.tipo;

  try {
    const get = await entrada_salida.findAll({
      where: {
        tipo: tipo,
        almacen_id: id,
      },
      attributes: { exclude: ["almacen_id", "alamcen_id", "producto_id"] },
      include: [{ model: producto_entrada_salida, include:[{model: producto, attributes: { exclude: ["categoria_id"] } }] }],
    });

    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const postEntradaSalida = async (req, res, next) => {
  let data = req.body.map((item) => {
    return {
      codigo: item.codigo,
      motivo: item.motivo,
      fecha: item.fecha,
      encargado: item.encargado,
      codigo_compra: item.codigo_compra,
      tipo: item.tipo,
      almacen_id: item.almacen_id,
      boleta: item.boleta,
      codigo_requerimiento: item.codigo_requerimiento,
    };
  });

  let updateStock = req.body.map((item) => {
    return {
      id: item.producto_id,
      stock: item.cantidad,
    };
  });

  try {
    const post = await entrada_salida.create(data[data.length - 1]);

    const ProductoEntrada = req.body.map((item) => {
      return {
        entrada_salida_id: post.id,
        producto_id: item.producto_id,
        categoria: item.categoria,
        cantidad: item.cantidad,
        costo: item.costo
      };
    });

    const updateMultiple = await Promise.all(
      updateStock.map(
        async (item) =>
          await producto.update(
            { stock: item.stock },
            {
              where: { id: item.id },
            }
          )
      )
    );

    const createProductoEntrada = await producto_entrada_salida.bulkCreate(
      ProductoEntrada
    );

    res.status(200).json({
      msg: `${data[data.length - 1]?.tipo} creada con éxito!`,
      status: 200,
    });

    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: `No se pudo crear la ${req.body.tipo}.`, status: 500 });
  }
};

const updateEntradaSalida = async (req, res, next) => {
  let id = req.params.id;

  let info = req.body.map((item) => {
    return {
      codigo: item.codigo,
      motivo: item.motivo,
      fecha: item.fecha,
      encargado: item.encargado,
      codigo_compra: item.codigo_compra,
      tipo: item.tipo,
      almacen_id: item.almacen_id,
      boleta: item.boleta,
      codigo_requerimiento: item.codigo_requerimiento,
    };
  });

  let updateStock = req.body.map((item) => {
    return {
      id: item.producto_id,
      stock: item.cantidad,
    };
  });

  console.log(updateStock);


  try {
    // let update = await entrada_salida.update(req.body, { where: { id: id } });
    res.status(200).json({ msg: "Actualizado con éxito !", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const deleteEntradaSalida = async (req, res, next) => {
  let id = req.params.id;
  try {
    let delete1 = await producto_entrada_salida.destroy({where: {entrada_salida_id: id}})
    let camp = await entrada_salida.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

module.exports = {
  getEntradaSalida,
  getEntradaByAlmacen,
  postEntradaSalida,
  updateEntradaSalida,
  deleteEntradaSalida,
};
