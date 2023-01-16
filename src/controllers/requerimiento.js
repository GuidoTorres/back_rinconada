const { requerimiento, requerimiento_producto, producto } = require("../../config/db");

const getRequerimiento = async (req, res, next) => {
  try {
    const get = await requerimiento.findAll({

      include:[{model:requerimiento_producto, include:[{model:producto, attributes: {exclude:["categoria_id"]}}]}],
      
    });
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getRequerimientoById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const getById = await requerimiento.findAll({
      where: { id: id },
    });
    res.status(200).json({ data: getById });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

const postARequerimiento = async (req, res, next) => {
  let data = req.body.map((item) => {
    return {
      codigo: item.codigo,
      fecha_pedido: item.fecha_pedido,
      fecha_entrega: item.fecha_entrega,
      solicitante: item.solicitante,
      area: item.area,
      celular: item.celular,
      proyecto: item.proyecto,
      almacen_id: item.almacen_id,
    };
  });

  try {
    const post = await requerimiento.create(data[data.length - 1]);

    const productoRequerimiento = req.body.map((item) => {
      return {
        requerimiento_id: post.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
      };
    });

    postProductoRequerimiento = await requerimiento_producto.bulkCreate(
      productoRequerimiento
    );

    res
      .status(200)
      .json({ msg: "Requerimiento creado con éxito!", status: 200 });

    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo crear.", status: 500 });
  }
};

const updateRequerimiento = async (req, res, next) => {
  let id = req.params.id;

  try {
    let update = await requerimiento.update(req.body, { where: { id: id } });
    const updateEstado = await requerimiento.findOne({
      where: { id: id },
    });

    if (
      updateEstado.aprobacion_jefe &&
      updateEstado.aprobacion_gerente &&
      updateEstado.aprobacion_superintendente
    ) {
      let update = await requerimiento.update(
        { estado: 1 },
        { where: { id: id } }
      );
    } else {
      let update = await requerimiento.update(
        { estado: 0 },
        { where: { id: id } }
      );
    }
    res
      .status(200)
      .json({ msg: "Requerimiento actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const deleteRequerimiento = async (req, res, next) => {
  let id = req.params.id;
  try {
    let camp = await requerimiento.destroy({ where: { id: id } });
    res
      .status(200)
      .json({ msg: "Requerimiento eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

module.exports = {
  getRequerimiento,
  getRequerimientoById,
  postARequerimiento,
  updateRequerimiento,
  deleteRequerimiento,
};
