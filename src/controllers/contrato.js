const { contrato } = require("../../config/db");
const trabajador = require("../../config/db");

const getContrato = async (req, res, next) => {
  try {
    const get = await contrato.findAll();
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getContratoById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const user = await contrato.findAll({
      include: [{ model: trabajador.trabajador }],
      where: { trabajador_id: id },
    });

    res.status(200).json({ data: user });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postContrato = async (req, res, next) => {
  let info = {
    fecha_inicio: req.body.fecha_inicio,
    codigo_contrato: req.body.codigo_contrato,
    tipo_contrato: req.body.tipo_contrato,
    recomendado_por: req.body.recomendado_por,
    cooperativa: req.body.cooperativa,
    condicion_cooperativa: req.body.condicion_cooperativa,
    periodo_trabajo: req.body.periodo_trabajo,
    fecha_fin: req.body.fecha_fin,
    gerencia: req.body.gerencia,
    area: req.body.area,
    jefe_directo: req.body.jefe_directo,
    base: req.body.base,
    termino_contrato: req.body.termino_contrato,
    campamento_id: req.body.campamento_id,
    trabajador_id: req.body.trabajador_id,
  };

  try {
    const post = await contrato.create(info);
    res.status(200).json(post);

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateContrato = async (req, res, next) => {
  let id = req.params.id;

  try {
    const put = await contrato.update(req.body, {
      where: { id: id },
    });
    res.status(200).json({ msg: "Contrato actualizado con éxito" });
    next();
  } catch (error) {
    res.status(500).json({ msg: error, status: 500 });
  }
};

const deleteContrato = async (req, res, next) => {
  let id = req.params.id;
  try {
    let remove = await contrato.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Contrato eliminado con éxito", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: error, status: 500 });
  }
};

module.exports = {
  getContrato,
  updateContrato,
  postContrato,
  deleteContrato,
  getContratoById,
};
