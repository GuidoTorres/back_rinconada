const dayjs = require("dayjs");
const {
  requerimiento,
  requerimiento_producto,
  producto,
  area,
  almacen,
  unidad,
  trabajador,
  contrato,
  asociacion,
  requerimiento_pedido,
  trabajador_contrato,
} = require("../../config/db");
const { Op, Sequelize } = require("sequelize");

const getRequerimiento = async (req, res, next) => {
  try {
    const getArea = await area.findAll({});
    const get = await requerimiento.findAll({
      include: [
        { model: almacen },
        { model: requerimiento_pedido },
        {
          model: requerimiento_producto,
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

    const formatData = get
      .map((item) => {
        return {
          id: item?.id,
          fecha_pedido: dayjs(item?.fecha_pedido).format("YYYY-MM-DD"),
          fecha_entrega: dayjs(item?.fecha_entrega).format("YYYY-MM-DD"),
          solicitante: item?.solicitante,
          area: item?.area,
          area_id: getArea?.filter((data) => data.nombre === item?.area).at(-1)
            ?.id,
          pedido_id: item.requerimiento_pedidos
            .map((data) => data.pedido_id)
            .toString(),
          celular: item?.celular,
          proyecto: item?.proyecto,
          codigo_requerimiento: item?.codigo_requerimiento,
          almacen_id: item?.almacen_id,
          almacen: item?.almacen?.nombre,
          estado: item?.estado,
          aprobacion_jefe: item?.aprobacion_jefe,
          aprobacion_gerente: item?.aprobacion_gerente,
          aprobacion_superintendente: item?.aprobacion_superintendente,
          completado: item?.completado,
          requerimiento_productos: item?.requerimiento_productos,
          dni: item?.dni,
        };
      })
      .sort((a, b) => {
        return b.id - a.id;
      });
    res.status(200).json({ data: formatData });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const postARequerimiento = async (req, res, next) => {
  let data = {
    dni: req.body.dni,
    codigo: req.body.codigo,
    fecha_pedido: req.body.fecha_pedido,
    fecha_entrega: req.body.fecha_entrega,
    solicitante: req.body.solicitante,
    area: req.body.area,
    celular: req.body.celular,
    proyecto: req.body.proyecto,
    almacen_id: req.body.almacen_id,
    completado: "Pendiente",
    estado: "Pendiente",
  };
  try {
    const post = await requerimiento.create(data);

    const productoRequerimiento = req.body.requerimientos.map((item) => {
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

    if (updateEstado.estado === "Pendiente") {
      if (
        updateEstado.aprobacion_jefe &&
        updateEstado.aprobacion_gerente &&
        updateEstado.aprobacion_superintendente
      ) {
        let update = await requerimiento.update(
          { estado: "Aprobado", completado: "Aprobado" },
          { where: { id: id } }
        );
      } else {
        let update = await requerimiento.update(
          { estado: "Pendiente", completado: "Aprobado" },
          { where: { id: id } }
        );
      }
      return res
        .status(200)
        .json({ msg: "Requerimiento actualizado con éxito!", status: 200 });
    } else {
      return res.status(200).json({
        msg: "El requerimiento ya fue aprobado, no se puede actualizar.",
        status: 200,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const updateRequerimientoProducto = async (req, res, next) => {
  let id = req.params.id;

  let data = {
    dni: req.body.dni,
    fecha_pedido: req.body.fecha_pedido,
    fecha_entrega: req.body.fecha_entrega,
    solicitante: req.body.solicitante,
    area: req.body.area,
    celular: req.body.celular,
    proyecto: req.body.proyecto,
  };
  console.log(req.body);
  try {
    let update = await requerimiento.update(data, {
      where: { id: id },
    });

    const updateRequerimientoProducto = req.body.requerimientos.map((item) => {
      return {
        requerimiento_id: id,
        producto_id: item.codigo_producto,
        cantidad: item.cantidad,
      };
    });

    const delReqProducto = await requerimiento_producto.destroy({
      where: { requerimiento_id: id },
    });

    let updateProducto = await requerimiento_producto.bulkCreate(
      updateRequerimientoProducto,
      {
        ignoreDuplicates: false,
      }
    );

    res
      .status(200)
      .json({ msg: "Requerimiento actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const deleteRequerimiento = async (req, res, next) => {
  let id = req.params.id;
  try {
    let getReq = await requerimiento.findOne({ where: { id: id } });

    console.log(getReq);
    if (getReq.estado === "Pendiente") {
      let delReqProducto = await requerimiento_producto.destroy({
        where: { requerimiento_id: id },
      });
      let camp = await requerimiento.destroy({ where: { id: id } });
      return res
        .status(200)
        .json({ msg: "Requerimiento eliminado con éxito!", status: 200 });
    } else {
      return res
        .status(500)
        .json({ msg: "No se puede eliminar el requerimiento.", status: 500 });
    }
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

const getLastId = async (req, res, next) => {
  try {
    const get = await requerimiento.findOne({
      order: [["id", "DESC"]],
    });

    const getId = get ? get?.id + 1 : 1;
    res.status(200).json({ data: getId });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener", status: 500 });
  }
};

const getTrabajadorRequerimiento = async (req, res, next) => {
  try {
    const getArea = await area.findAll();
    const get = await trabajador.findAll({
      where: {
        [Op.and]: [{ deshabilitado: { [Op.not]: true } }],
      },
      attributes: ["dni", "apellido_paterno", "apellido_materno", "nombre"],
      include: [
        {
          model: trabajador_contrato,
          include: [
            { model: contrato, attributes: { exclude: ["contrato_id"] } },
          ],
        },
      ],
    });

    const format = get.map((item) => {
      return {
        dni: item?.dni,
        nombre:
          item?.apellido_paterno +
          " " +
          item?.apellido_materno +
          " " +
          item?.nombre,
        contrato: item?.trabajador_contratos
          ?.map((data) => data?.contrato)
          ?.filter((data) => data?.finalizado === false),
        area: getArea?.filter(
          (data) =>
            data?.nombre ===
            item?.trabajador_contratos
              ?.map((data) => data?.contrato)
              ?.filter((data) => data?.finalizado === false)
              ?.at(-1)?.area
        ).at(-1),
      };
    });

    res.status(200).json({ data: format });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

module.exports = {
  getRequerimiento,
  // getRequerimientoById,
  postARequerimiento,
  updateRequerimiento,
  deleteRequerimiento,
  updateRequerimientoProducto,
  getLastId,
  getTrabajadorRequerimiento,
};
