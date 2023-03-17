const {
  entrada_salida,
  producto,
  producto_entrada_salida,
  area,
  requerimiento,
  pedido,
  requerimiento_pedido,
  unidad,
} = require("../../config/db");
const { Op } = require("sequelize");

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
      include: [
        { model: area },
        {
          model: producto_entrada_salida,
          include: [
            {
              model: producto,
              attributes: { exclude: ["categoria_id"] },
              include: [{ model: unidad }],
            },
          ],
        },
      ],
    });

    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const postEntradaSalida = async (req, res, next) => {
  let data;
  let updateStock;
  const filterTipoSalida = req.body.filter((item) => item.tipo === "salida");
  const filterTipoEntrada = req.body.filter((item) => item.tipo === "entrada");

  if (filterTipoSalida.length > 0) {
    data = {
      codigo: filterTipoSalida.at(-1).codigo,
      motivo: filterTipoSalida.at(-1).motivo,
      encargado: filterTipoSalida.at(-1).encargado,
      tipo: filterTipoSalida.at(-1).tipo,
      almacen_id: filterTipoSalida.at(-1).almacen_id,
      area_id: filterTipoSalida.at(-1).area_id,
      cantidad: filterTipoSalida.at(-1).cantidad,
      dni: filterTipoSalida.at(-1).dni,
      fecha: filterTipoSalida.at(-1).fecha,
      costo: filterTipoSalida.at(-1).costo_total,
      costo_total: req.body.reduce(
        (acc, value) => parseFloat(acc) + parseFloat(value.costo_total),
        0
      ),
    };

    updateStock = req.body.map((item) => {
      return {
        id: item.producto_id,
        stock: parseInt(item.stock) - parseInt(item.cantidad),
      };
    });
  }
  if (filterTipoEntrada.length > 0) {
    data = {
      codigo: filterTipoEntrada.at(-1).codigo,
      motivo: filterTipoEntrada.at(-1).motivo,
      fecha: filterTipoEntrada.at(-1).fecha,
      encargado: filterTipoEntrada.at(-1).encargado,
      codigo_compra: filterTipoEntrada.at(-1).codigo_compra,
      tipo: filterTipoEntrada.at(-1).tipo,
      almacen_id: filterTipoEntrada.at(-1).almacen_id,
      boleta: filterTipoEntrada.at(-1).boleta,
      codigo_requerimiento: filterTipoEntrada.at(-1).codigo_requerimiento,
      solicitante: filterTipoEntrada.at(-1).solicitante,
      unidad: filterTipoEntrada.at(-1).unidad,
      dni: filterTipoEntrada.at(-1).dni,
      codigo_pedido: filterTipoEntrada.at(-1).codigo_pedido,
    };

    updateStock = req.body.map((item) => {
      return {
        id: item.producto_id,
        stock: parseInt(item.stock) + parseInt(item.cantidad),
      };
    });
  }
  console.log(data);
  try {
    const post = await entrada_salida.create(data);

    const ProductoEntrada = req.body.map((item) => {
      return {
        entrada_salida_id: post.id,
        producto_id: item.producto_id,
        categoria: item.categoria_id || "",
        cantidad: item.cantidad,
        costo: item.costo,
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

    // al crear la entrada cambia el estado a en almacen
    if (
      req.body.at(-1).codigo_requerimiento !== "" &&
      req.body.at(-1).tipo === "entrada"
    ) {
      const ids = req.body.at(-1).codigo_requerimiento;

      const idSplit = ids.split(",");

      const pedidoGet = await pedido.findAll({
        where: { id: req.body.at(-1).codigo_pedido },
        include: [{ model: requerimiento_pedido }],
      });

      const estadoReqPedido = pedidoGet
        .map((item) => item.requerimiento_pedidos)
        .flat()
        .map((item) => item.estado)
        .filter((item) => item === null);

      if (estadoReqPedido === 0) {
        const updatePedido = await pedido.update(
          { estado: "En almacén" },
          { where: { id: req.body.at(-1).codigo_pedido } }
        );
      }

      const updateRequerimiento = await requerimiento.update(
        { estado: "En almacén" },
        { where: { id: idSplit } }
      );

      const updateRequerimientoPedido = await requerimiento_pedido.update(
        { estado: "entrada" },
        { where: { requerimiento_id: idSplit } }
      );
      console.log(updateRequerimientoPedido);
    }

    // al registrar la salida  del requerimiento cambia el estado
    // del requerimiento a entragado
    if (
      req.body.at(-1).codigo_requerimiento !== "" &&
      req.body.at(-1).tipo === "salida"
    ) {
      const ids = req.body.at(-1).codigo_requerimiento;

      const updateRequerimiento = await requerimiento.update(
        { estado: "Entregado" },
        { where: { id: ids } }
      );

      const updateRequerimientoPedido = await requerimiento_pedido.update(
        { estado: "Entregado" },
        { where: { requerimiento_id: ids } }
      );
    }
    res.status(200).json({
      msg: `${data?.tipo} creada con éxito!`,
      status: 200,
    });

    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: `No se pudo crear la ${req.body[0].tipo}.`, status: 500 });
  }
};

const updateEntradaSalida = async (req, res, next) => {
  let id = req.params.id;
  let obj;
  if (req.body.at(-1).tipo === "entrada") {
    obj = {
      motivo: req.body.at(-1).motivo,
      fecha: req.body.at(-1).fecha,
      dni: req.body.at(-1).dni,
      encargado: req.body.at(-1).encargado,
      codigo_compra: req.body.at(-1).codigo_compra,
      boleta: req.body.at(-1).boleta,
    };
  } else {
    obj = {
      motivo: req.body.at(-1).motivo,
      fecha: req.body.at(-1).fecha,
      dni: req.body.at(-1).dni,
      encargado: req.body.at(-1).personal,
      area_id: req.body.at(-1).area_id,
    };
  }

  let updateStock = req.body.map((item) => {
    return {
      id: item.producto_id,
      stock: item.cantidad,
    };
  });
  console.log(obj);
  try {
    let update = await entrada_salida.update(obj, { where: { id: id } });
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
    let delete1 = await producto_entrada_salida.destroy({
      where: { entrada_salida_id: id },
    });
    let camp = await entrada_salida.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

const entradaSalidaEstadistica = async (req, res, next) => {
  try {
    let fecha_inicio = req.body?.fecha_inicio?.split("T")[0];
    let fecha_fin = req.body?.fecha_fin?.split("T")[0];
    const getIngresoEgresos = await entrada_salida.findAll({
      where: {
        fecha: { [Op.between]: [fecha_inicio, fecha_fin] },
        tipo: "salida",
      },
      include: [{ model: area }, { model: producto_entrada_salida }],
    });

    const formatData = getIngresoEgresos.map((item) => {
      return {
        id: item?.area?.id,
        area: item?.area?.nombre,
        costo: parseInt(item.costo_total),
      };
    });

    let reduce = formatData.reduce((value, current) => {
      let temp = value.find((o) => o.area === current.area);
      if (temp) {
        temp.costo += current.costo;
        Object.assign(temp);
      } else {
        value.push(current);
      }
      return value;
    }, []);

    res.status(200).json({ data: reduce });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: error });
  }
};

module.exports = {
  getEntradaSalida,
  getEntradaByAlmacen,
  postEntradaSalida,
  updateEntradaSalida,
  deleteEntradaSalida,
  entradaSalidaEstadistica,
};
