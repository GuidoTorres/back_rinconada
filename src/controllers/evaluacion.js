const { evaluacion } = require("../../config/db");
const contrato = require("../../config/db");
const trabajador = require("../../config/db");

const getEvaluacion = async (req, res, next) => {
  try {
    const get = await evaluacion.findAll();
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getEvaluacionById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const user = await evaluacion.findAll({
      where: { contrato_id: id },
      include: [
        {
          model: contrato.contrato,
          include: [{ model: trabajador.trabajador }],
        },
      ],
    });

    const obj = user.map((item) => {
      return {
        id: item.id,
        dni: item.contrato.trabajador.dni,
        nombre:
          item.contrato.trabajador.nombre +
          " " +
          item.contrato.trabajador.apellido_paterno +
          " " +
          item.contrato.trabajador.apellido_materno,
        fecha_evaluacion: item.fecha_evaluacion,
        nota: item.evaluacion_laboral,
        // nombre: item?.contrato.map((data) => data?.trabajador),
        // campamento: item?.contratos.map((item) => item?.campamento?.nombre),
      };
    });
    res.status(200).json({ data: user });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const postEvaluacion = async (req, res, next) => {
  let info = {
    fecha_evaluacion: req.body.fecha_evaluacion,
    puesto: req.body.puesto,
    capacitacion_sso: req.body.capacitacion_sso,
    capacitacion_gema: req.body.capacitacion_gema,
    evaluacion_laboral: req.body.evaluacion_laboral,
    presion_arterial: req.body.presion_arterial,
    temperatura: req.body.temperatura,
    saturacion: req.body.saturacion,
    imc: req.body.imc,
    pulso: req.body.pulso,
    diabetes: req.body.diabetes,
    antecedentes: req.body.antecedentes,
    emo: req.body.emo,
  };

  try {
    const post = await evaluacion.create(info);
    res.status(200).json(post);

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateEvaluacion = async (req, res, next) => {
  let id = req.params.id;

  try {
    const put = await evaluacion.update(req.body, {
      where: { id: id },
    });
    res.status(200).json({ msg: "Evaluacion actualizada con éxito" });
    next();
  } catch (error) {
    res.status(500).json({ msg: error, status: 500 });
  }
};

const deleteEvaluacion = async (req, res, next) => {
  let id = req.params.id;
  try {
    let response = await evaluacion.destroy({ where: { id: id } });
    res
      .status(200)
      .json({ msg: "Evaluación eliminada con éxito", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: error, status: 500 });
  }
};

module.exports = {
  getEvaluacion,
  postEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getEvaluacionById,
};
