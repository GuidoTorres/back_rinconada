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
const XLSX = require("xlsx");

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
// const getAsistenciaByCampamento = async (req, res, next) => {
//   let id = req.params.id;

//   try {
//     const all = await asistencia.findAll({
//       where: { campamento_id: id },
//     });
//     res.status(200).json({ data: all });
//     next();
//   } catch (error) {
//     res.status(500).json();
//   }
// };

const getExcelAsistencia = async (req, res, next) => {
  try {
    const workbook = XLSX.readFile("./upload/asistencia.xlsx");
    const workbookSheets = workbook.SheetNames;
    const sheet = workbookSheets[0];
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    const prueba = dataExcel[2];

    const result = dataExcel.map((v) =>
      Object.entries(v).reduce(
        (acc, [key, value]) =>
          Object.assign(acc, { [key.replace(/\s+/g, "_")]: value }),
        {}
      )
    );

    const prueba2 = result.map((item, i) => {
      const index = i + 1;
      return {
        dni: item.__EMPTY,
        nombre: item._Reporte_de_Turnos,
      };
    });

    res.status(200).json({ data: dataExcel });
    next();
  } catch (error) {
    console.log(error);
  }
};

const getTrabajadorAsistencia = async (req, res, next) => {
  try {
    const get = await trabajador.findAll({
      include: [
        {
          model: evaluacion,
          include: [
            { model: contrato, attributes: { exclude: ["contrato_id"] } },
          ],
        },
      ],
    });
    const filterDeshabilitado = get.filter(
      (item) => item.deshabilitado === false || item.deshabilitado === null
    );
    const filter = filterDeshabilitado.filter(
      (item) => item.evaluacions.length !== 0
    );
    const filterContrato = filter.filter((item) =>
      item.evaluacions.filter((data) => data.contratos.length !== 0)
    );

    res.status(200).json({ data: filterContrato });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error, status: 500 });
  }
};

//obtener todos los trabajadores por campamento para marcar asistencia
const getTrabajadorByCampamento = async (req, res, next) => {
  let id = req.params.id;
  let id_asis = req.params.asistencia;

  try {
    const get = await campamento.findAll({
      where: { id: id },
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [
            {
              model: contratoEvaluacion,
              include: [
                {
                  model: evaluacion,
                  include: [
                    {
                      model: trabajador,

                      include: [
                        {
                          model: trabajadorAsistencia,
                          // where: { asistencia_id: asis },
                          attributes: {
                            exclude: ["trabajadorId", "asistenciumId"],
                          },
                        },
                      ],
                    },
                  ],
                },
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
    //corregir esta devolviendo 2 asistencia por dia
    const filterAsistencia = obj2.filter((item) =>
      item.trabajador_asistencia.filter((data) => data.asistencia_id == id_asis)
    );
    // const filter = obj2.filter((item) => item !== null);
    res.status(200).json({ data: filterAsistencia });
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

    if (getAsistencia) {
      const updateAsistencia = await trabajadorAsistencia.update(info, {
        where: {
          asistencia_id: info.asistencia_id,
          trabajador_id: info.trabajador_id,
        },
      });
      res.status(200).json({ data: updateAsistencia });
    } else if (!getAsistencia) {
      const createAsistencia = await trabajadorAsistencia.create(info);
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

const deleteAsistencia = async (req, res, next) => {
  let id = req.params.id;
  try {
    let delAsis = await asistencia.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Asistencia eliminada con éxito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getAsistencia,
  postAsistencia,
  // getAsistenciaByCampamento,
  getTrabajadorByCampamento,
  postTrabajadorAsistencia,
  updateTrabajadorAsistencia,
  deleteAsistencia,
  getTrabajadorAsistencia,
  getExcelAsistencia,
};
