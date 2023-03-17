const {
  evaluacion,
  trabajador,
  contrato,
  contratoEvaluacion,
} = require("../../config/db");
const dayjs = require("dayjs");

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
      include: [
        {
          model: trabajador,
          attributes: { exclude: ["usuarioId"] },
          include: [
            { model: contrato, attributes: { exclude: ["contrato_id"] } },
          ],
        },
      ],
    });
    const obj = user.map((item) => {
      return {
        evaluacion_id: item?.id,
        trabajador_id: item?.trabajador?.id,
        fecha_evaluacion: dayjs(item?.fecha_evaluacion),
        evaluacion_laboral: item?.evaluacion_laboral,
        finalizado: item?.finalizado,
        antecedentes: item?.antecedentes,
        capacitacion_gema: item?.capacitacion_gema,
        capacitacion_sso: item?.capacitacion_sso,
        area: item?.area,
        campamento: item?.campamento,
        diabetes: item?.diabetes,
        emo: item?.emo,
        imc: item?.imc,
        presion_arterial: item?.presion_arterial,
        puesto: item?.puesto,
        pulso: item?.pulso,
        saturacion: item?.saturacion,
        temperatura: item?.temperatura,
        aprobado: item?.aprobado,
        recomendado_por: item?.recomendado_por,
        cooperativa: item?.cooperativa,
        condicion_cooperativa: item?.condicion_cooperativa,
        nombre:
          item?.trabajador?.nombre +
          " " +
          item?.trabajador?.apellido_paterno +
          " " +
          item?.trabajador?.apellido_materno,
        control: item?.control,
        topico: item?.topico,
        seguridad: item?.seguridad,
        medio_ambiente: item?.medio_ambiente,
        fiscalizador: item?.fiscalizador,
        fiscalizador_aprobado: item?.fiscalizador_aprobado,
        topico_observacion: item?.topico_observacion,
        control_observacion: item?.control_observacion,
        seguridad_observacion: item?.seguridad_observacion,
        medio_ambiente_observacion: item?.medio_ambiente_observacion,
        recursos_humanos: item?.recursos_humanos,
        recursos_humanos_observacion: item?.recursos_humanos_observacion,
        estado_contrato: item?.contrato_evaluacions
          ?.map((data) => data?.contrato?.estado)
          .toString(),
        nota_contrato: item?.contrato_evaluacions
          ?.map((data) => data?.contrato?.nota_contrato)
          .toString(),
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
    fecha_evaluacion: req?.body?.fecha_evaluacion,
    puesto: req?.body?.puesto,
    capacitacion_sso: req?.body?.capacitacion_sso,
    capacitacion_gema: req?.body?.capacitacion_gema,
    evaluacion_laboral: req?.body?.evaluacion_laboral,
    presion_arterial: req?.body?.presion_arterial,
    temperatura: req?.body?.temperatura,
    saturacion: req?.body?.saturacion,
    imc: req?.body?.imc,
    pulso: req?.body?.pulso,
    diabetes: req?.body?.diabetes,
    antecedentes: req?.body?.antecedentes,
    emo: req?.body?.emo,
    trabajador_id: req?.body?.trabajador_id,
    aprobado: req?.body?.aprobado,
    control: req?.body?.control,
    topico: req?.body?.topico,
    seguridad: req?.body?.seguridad,
    medio_ambiente: req?.body?.medio_ambiente,
    recomendado_por: req?.body?.recomendado_por,
    cooperativa: req?.body?.cooperativa,
    condicion_cooperativa: req?.body?.condicion_cooperativa,
    fiscalizador: req?.body?.fiscalizador,
    fiscalizador_aprobado: req?.body?.fiscalizador_aprobado,
    topico_observacion: req?.body?.topico_observacion,
    control_observacion: req?.body?.control_observacion,
    seguridad_observacion: req?.body?.seguridad_observacion,
    medio_ambiente_observacion: req?.body?.medio_ambiente_observacion,
    recursos_humanos: req?.body?.recursos_humanos,
    recursos_humanos_observacion: req?.body?.recursos_humanos_observacion,
    finalizado: req?.body?.finalizado,
    area: req?.body?.area,
    campamento: req?.body?.campamento,
  };

  try {
    const get = await evaluacion.findAll({
      where: { trabajador_id: info.trabajador_id },
    });
    const filter = get.filter((item) => item.finalizado === false);

    const { fecha_evaluacion } = req.body;

    if (fecha_evaluacion === "") {
      return res.status(500).json({
        msg: "Ingrese una fecha para registrar la evaluación.",
        status: 500,
      });
    } else {
      if (filter.length > 0) {
        return res.status(500).json({
          msg: "No se pudo crear la evaluación, el trabajador tiene una evaluación activa.",
          status: 500,
        });
      } else {
        const post = await evaluacion.create(info);
        return res
          .status(200)
          .json({ msg: "Evaluación creada con éxito!", status: 200 });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo crear la evaluación.", status: 500 });
  }
};

const updateEvaluacion = async (req, res, next) => {
  let id = req.params.id;

  try {
    const put = await evaluacion.update(req.body, {
      where: { id: id },
    });
    res
      .status(200)
      .json({ msg: "Evaluacion actualizada con éxito!", status: 200 });
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
    res
      .status(500)
      .json({ msg: "No se pudo eliminar la evaluación.", status: 500 });
  }
};

module.exports = {
  getEvaluacion,
  postEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getEvaluacionById,
};
