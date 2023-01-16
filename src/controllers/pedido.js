const {
  pedido,
  requerimiento_pedido,
  requerimiento,
  requerimiento_producto,
  producto,
} = require("../../config/db");
const {
  generarPdfRequerimiento,
} = require("../utills/PDF/requerimientoBienes");
const _ = require("lodash");


const getPedidoId = async(req, res, next ) => {

  try {
    const get = await pedido.findAll()
    res.status(200).json({ data: get });
    next();
    
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }

}

const getPedido = async (req, res, next) => {
  try {
    const get = await pedido.findAll({
      include: [
        {
          model: requerimiento_pedido,
          include: [
            {
              model: requerimiento,
              include: [
                {
                  model: requerimiento_producto,
                  include: [{ model: producto , attributes: {exclude:["categoria_id"]} }],
                },
              ],
            },
          ],
        },
      ],
    });

    const formatData = get.map((item) => {
      return {
        id: item.id,
        fecha: item.fecha,
        estado: item.estado,
        area: item.requerimiento_pedidos.map((data) => data.requerimiento.area),
        // producto: _.groupBy([
        //   ...new Set(
        //     item.requerimiento_pedidos
        //       .map((data) =>
        //         data.requerimiento.requerimiento_productos.map((dat) => {
        //           return {
        //             // nombre: dat.producto.nombre,
        //             categoria: dat.producto.categoria,
        //             cantidad: item.cantidad
        //           };
        //         })
        //       )
        //       .flat()
        //   ),
        // ], "categoria"),
      };
    });

    //corregir los productos por categoria
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

// const getPedidoById = async (req, res, next) => {
//   let id = req.params.id;

//   try {
//     const getById = await pedido.findAll({
//       where: { id: id },
//     });
//     res.status(200).json({ data: getById });
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: error });
//   }
// };

const postPedido = async (req, res, next) => {
  let info = {
    fecha: req.body.fecha,
    estado: req.body.estado,
    area: req.body.area,
    celular: req.body.celular,
    proyecto: req.body.fecha,
    solicitante: req.body.solicitante,
  };
  console.log(req.body.req_id);
  try {
    const post = await pedido.create(info);

    let requerimientoPedido = req.body.req_id.map((item) => {
      return {
        requerimiento_id: item,
        pedido_id: post.id,
      };
    });

    const req_pedido = await requerimiento_pedido.bulkCreate(
      requerimientoPedido
    );

    const updateRequerimiento = await requerimiento.update(
      { completado: true },
      {
        where: {
          id: req.body.req_id,
        },
      }
    );
    res.status(200).json({ msg: "Pedido generado con éxito!", status: 200 });

    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo crear.", status: 500 });
  }
};

const updatePedido = async (req, res, next) => {
  let id = req.params.id;

  try {
    let update = await pedido.update(req.body, { where: { id: id } });
    res.status(200).json({ msg: "Actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const deletePedido = async (req, res, next) => {
  let id = req.params.id;
  try {
    let camp = await pedido.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Pedido eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

const getPedidoProducto = async (req, res, next) => {
  let id = req.params.id;

  try {
    let getPedido = await pedido.findAll({
      include: [
        {
          model: requerimiento_pedido,
          include: [
            {
              model: requerimiento,
              include: [
                {
                  model: requerimiento_producto,
                  include: [{ model: producto, attributes: { exclude: ["categoria_id"] }  }],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({ data: getPedido });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const descargarPedido = async (req, res, next) => {
  let id = req.params.id;

  try {
    const get = await pedido.findOne({
      where: { id: id },
      include: [
        {
          model: requerimiento_pedido,
          include: [
            {
              model: requerimiento,
              include: [
                {
                  model: requerimiento_producto,
                  include: [{ model: producto }],
                },
              ],
            },
          ],
        },
      ],
    });

    const response = generarPdfRequerimiento(get);

    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  getPedido,
  // getPedidoById,
  postPedido,
  updatePedido,
  deletePedido,
  getPedidoProducto,
  descargarPedido,
  getPedidoId
};
