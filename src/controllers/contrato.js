const {
  contrato,
  trabajador,
  evaluacion,
  contratoEvaluacion,
} = require("../../config/db");

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
      include: [{ model: evaluacion, where: { trabajador_id: id } }],
    });

    // const obj = user
    //   .filter((item) => item.contrato !== null)
    //   .map((item) => {
    //     return {
    //       id: item.id,
    //       contrato: item.contrato,
    //     };
    //   });

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
    nota_contrato: req.body.nota_contrato,
    puesto: req.body.puesto,
    campamento_id: req.body.campamento_id,
    empresa_id: req.body.empresa_id,
    evaluacion_id: req.body.evaluacion_id,
  };

  try {
    const post = await contrato.create(info);

    const tablaIntermedia = await contratoEvaluacion.create({
      contrato_id: post.id,
      evaluacion_id: req.body.evaluacion_id,
    });
    console.log(tablaIntermedia);
    res.status(200).json(info);

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

// terminar
const postContratoAsociacion = async (req, res, next) => {
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
    nota_contrato: req.body.nota_contrato,
    puesto: req.body.puesto,
    campamento_id: req.body.campamento_id,
    empresa_id: req.body.empresa_id,
    asociacion_id: req.body.asociacion_id,
  };

  try {
    console.log("lo intento");
    if (req.body.evaluacion_id.length > 0) {
      const post = await contrato.create(info);
      const createEvaluacionContrato = req.body.evaluacion_id.map((item) => {
        return {
          contrato_id: post.id,
          evaluacion_id: item,
        };
      });
      const tablaIntermedia = await contratoEvaluacion.bulkCreate(createEvaluacionContrato);
      res.status(200).json(tablaIntermedia);
    }

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
    
    console.log(put);
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
  postContratoAsociacion,
};
