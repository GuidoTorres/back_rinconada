const { entrada_salida } = require("../../config/db");

const getEntradaByAlmacen = async (req, res, next) => {
  let id = req.params.id;
  let tipo = req.params.tipo;

  try {
    const get = await entrada_salida.findAll({
      where: {
        tipo: tipo,
        almacen_id: id,
      },
    });
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const postEntradaSalida = async (req, res, next) => {
  let info = {
    codigo: req.body.codigo,
    motivo: req.body.motivo,
    fecha: req.body.fecha,
    encargado: req.body.encargado,
    codigo_compra: req.body.codigo_compra,
    tipo: req.body.tipo,
    almacen_id: req.body.almacen_id,
  };

  try {
    const post = await entrada_salida.create(info);
    res
      .status(200)
      .json({ msg: `${req.body.tipo} creada con éxito!`, status: 200 });

    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: `No se pudo crear la ${req.body.tipo}.`, status: 500 });
  }
};

const updateEntradaSalida = async (req, res, next) => {
  let id = req.params.id;

  try {
    let update = await entrada_salida.update(req.body, { where: { id: id } });
    res.status(200).json({ msg: "Actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const deleteEntradaSalida = async (req, res, next) => {
  let id = req.params.id;
  try {
    let camp = await entrada_salida.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

module.exports = {
  getEntradaByAlmacen,
  postEntradaSalida,
  updateEntradaSalida,
  deleteEntradaSalida,
};
