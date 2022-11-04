const { where } = require("sequelize");
const {
  asistencia,
  contrato,
  campamento,
  evaluacion,
  trabajador,
  contratoEvaluacion,
  trabajadorAsistencia,
} = require("../../config/db");

const getAsistencia = async (req, res, next) => {
  try {
    const all = await asistencia.findAll();
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

//obtiene las fechas de asistenecia por campamento
const getAsistenciaByCampamento = async (req, res, next) => {
  let id = req.params.id;

  try {
    const all = await asistencia.findAll({
      where: { campamento_id: id },
    });
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

//obtener todos los trabajadores por campamento para marcar asistencia
const getTrabajadorByCampamento = async (req, res, next) => {
  let id = req.params.id;

  try {

    
    const get = await campamento.findAll({
      where: { id: id },
      include: [
        // {
        //   model: asistencia,
        //   include: [
        //     {
        //       model: trabajadorAsistencia,
        //       attributes: { exclude: ["trabajadorId", "asistenciumId"] },
        //     },
        //   ],
        // },
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [
            {
              model: contratoEvaluacion,
              include: [
                { model: evaluacion, include: [{ model: trabajador }] },
              ],
            },
          ],
        },
      ],
    });

    const obj = get
      .map((item) =>
        item.contratos
          .map((data) => data.contrato_evaluacions.map((dat) => dat.evaluacion))
          .flat()
      )
      .flat();
    const obj2 = obj.map((item) => item.trabajador);
    res.status(200).json({ data: obj2 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const postAsistencia = async (req, res, next) => {
  let info = {
    fecha: req.body.fecha,
    campamento_id: req.body.campamento_id,
  };

  try {
    const all = await asistencia.findAll({ raw: true });

    const filter = all.filter(
      (item) =>
        item.fecha === info.fecha && item.campamento_id === info.campamento_id
    );

    if (filter.length > 0) {
      res.status(500).json({ error: "Fecha ya creada" });
      next();
    } else if (filter.length === 0) {
      const asis = await asistencia.create(info);
      res.status(200).json({ data: asis });
      next();
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const postTrabajadorAsistencia = async (req, res, next) => {
  const info = {
    asistencia_id: req.body.asistencia_id,
    trabajador_id: req.body.trabajador_id,
    asistencia: req.body.asistencia,
    // observacion: req.body.observacion,
  };

  try {
    const getAsistencia = await trabajadorAsistencia.findOne({
      raw: true,
      attributes: { exclude: ["trabajadorId", "asistenciumId"] },

      where: {
        asistencia_id: info.asistencia_id,
        trabajador_id: info.trabajador_id,
      },
    });
    console.log(getAsistencia);

    if (getAsistencia) {
      const updateAsistencia = await trabajadorAsistencia.update(info, {
        where: {
          asistencia_id: info.asistencia_id,
          trabajador_id: info.trabajador_id,
        },
      });
      console.log("update");
      res.status(200).json({ data: updateAsistencia });
    } else if (!getAsistencia) {
      const createAsistencia = await trabajadorAsistencia.create(info);
      console.log("create");
      res.status(200).json({ data: createAsistencia });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const updateTrabajadorAsistencia = async (req, res, next) => {
  const info = {
    asistencia_id: req.body.asistencia_id,
    trabajador_id: req.body.trabajador_id,
    asistencia: req.body.asistencia,
    // observacion: req.body.observacion,
  };

  try {
    const updateAsistencia = await trabajadorAsistencia.update(info);
    res.status(200).json({ data: updateAsistencia });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  getAsistencia,
  postAsistencia,
  getAsistenciaByCampamento,
  getTrabajadorByCampamento,
  postTrabajadorAsistencia,
  updateTrabajadorAsistencia,
};
