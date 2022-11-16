const { evaluacion, trabajador } = require("../../config/db");
const contrato = require("../../config/db");

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
      where: { trabajador_id: id },
      include: [{ model: trabajador }],
    });
    const obj = user.map((item) => {
      return {
        evaluacion_id: item.id,
        trabajador_id: item.trabajador.id,
        fecha_evaluacion: item.fecha_evaluacion,
        evaluacion_laboral: item.evaluacion_laboral,
        antecedentes: item.antecedentes,
        capacitacion_gema: item.capacitacion_gema,
        capacitacion_sso: item.capacitacion_sso,
        diabetes: item.diabetes,
        emo: item.emo,
        imc: item.imc,
        presion_arterial: item.presion_arterial,
        puesto: item.puesto,
        pulso: item.pulso,
        saturacion: item.saturacion,
        temperatura: item.temperatura,
        aprobado: item.aprobado,
        recomendado_por: item.recomendado_por,
        cooperativa: item.cooperativa,
        condicion_cooperativa: item.condicion_cooperativa,
        nombre:
          item.trabajador.nombre +
          " " +
          item.trabajador.apellido_paterno +
          " " +
          item.trabajador.apellido_materno,
        control: item.control,
        topico:item.topico,
        seguridad: item.seguridad,
        medio_ambiente: item.medio_ambiente
      };
    });
    res.status(200).json({ data: obj });

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
    trabajador_id: req.body.trabajador_id,
    aprobado: req.body.aprobado,
    control: req.body.control,
    topico: req.body.topico,
    seguridad: req.body. seguridad,
    medio_ambiente: req.body.medio_ambiente,
    recomendado_por: req.body.recomendado_por,
    cooperativa: req.body.cooperativa,
    condicion_cooperativa: req.body.condicion_cooperativa
  };

  try {
    const post = await evaluacion.create(info);
    res.status(200).json({ msg: "Evaluación creada con éxito!", status: 200 });

    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo crear la evaluación.", status: 500 });
  }
};

const updateEvaluacion = async (req, res, next) => {
  let id = req.params.id;

  try {
    const put = await evaluacion.update(req.body, {
      where: { id: id },
    });
    res.status(200).json({ msg: "Evaluacion actualizada con éxito!", status:200 });
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
      .json({ msg: "Evaluación eliminada con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar la evaluación.", status: 500 });
  }
};

module.exports = {
  getEvaluacion,
  postEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getEvaluacionById,
};
