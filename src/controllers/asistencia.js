const { where, TimeoutError } = require("sequelize");
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
const date = require("date-and-time");

const getAsistencia = async (req, res, next) => {
  try {
    const all = await asistencia.findAll();
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const updateAsistencia = async (req, res, next) => {
  let id = req.params.id;

  try {
    const updateAsistencia = await asistencia.update(req.body, {
      where: { id: id },
    });
    res.status(200).json({ msg: "Actualizado con éxito!", status: 200 });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

//para subir el excel de asistencias
const getExcelAsistencia = async (req, res, next) => {
  try {
    const workbook = XLSX.readFile("./upload/asistencia.xlsx");
    const workbookSheets = workbook.SheetNames;

    const index = workbookSheets.indexOf("Reporte de Excepciones");
    const sheet = workbookSheets[index];
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    const result = dataExcel.map((v) =>
      Object.entries(v).reduce(
        (acc, [key, value]) =>
          Object.assign(acc, { [key.replace(/\s+/g, "_")]: value }),
        {}
      )
    );

    const fechaActual = new Date();
    const fecha = date.format(fechaActual, "YYYY-MM-DD");
    const fechaBd = fechaActual.toLocaleDateString("es-PE");

    console.log(fecha);
    console.log(fechaBd);

    //para darle un formato usable a la data del excel
    const jsonFormat = result.slice(3).map((item, i) => {
      return {
        dni: item.Reporte_de_Excepciones,
        nombre: item.__EMPTY,
        fecha: new Date(item.__EMPTY_2).toLocaleDateString("es-PE"),
        entrada: item.__EMPTY_3 === undefined ? "" : item.__EMPTY_3,
        salida: item.__EMPTY_4 === undefined ? "" : item.__EMPTY_4,
      };
    });

    //obtengo solo las asistencias del dia actual que se encuentran en el excel
    const asistenciaExcelDiaActual = jsonFormat.filter(
      //aqui va la fecha para filtra fecha del excel
      (item) => item.fecha === fechaBd
    );

    //creo array de dnis para hacer busqueda
    const dni = jsonFormat.map((item) => item.dni).flat();
    const filtereDni = [...new Set(dni)];
    //obtener el id de la fecha para la asistencia
    const idAsistencia = await asistencia.findAll({
      //aqui fechaBD
      where: { fecha: fechaBd },
    });

    //todos los trabajadores con dni del excel
    const getTrabajadores = await trabajador.findAll({
      include: [
        {
          model: trabajadorAsistencia,
          // where: { asistencia_id: id },
          attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
        },
        {
          model: evaluacion,
          include: [
            { model: contrato, attributes: { exclude: ["contrato_id"] } },
          ],
        },
      ],
    });

    const filterDeshabilitado = getTrabajadores.filter(
      (item) => item.deshabilitado === false || item.deshabilitado === null
    );
    const filter = filterDeshabilitado.filter(
      (item) => item.evaluacions.length !== 0
    );
    const filterContrato = filter.filter((item) =>
      item.evaluacions.filter((data) => data.contratos.length !== 0)
    );

    const getAsistenciaId = await asistencia.findAll({
      raw: true,
      where: { fecha: fechaBd },
    });

    const idFechaAsistencia = parseInt(getAsistenciaId.map((item) => item.id));

    //para obtener trabajadores que tengan asistencia el dia actual
    const trabajadorTieneAsistencia = await trabajadorAsistencia.findAll({
      attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
      where: { trabajador_id: filtereDni, asistencia_id: idFechaAsistencia },
    });

    let hora_bd = idAsistencia.map((item) => item.hora_ingreso).toString();
    //json con formato para guardar en la db de todos los trabajadores del excel
    const asistenciasFechaActualExcel = asistenciaExcelDiaActual.map((item) => {
      const tarde =
        new Date(fecha + " " + hora_bd).getTime() -
        new Date(fecha + " " + item.entrada).getTime();
      return {
        asistencia_id: idFechaAsistencia,
        trabajador_id: parseInt(item.dni),
        asistencia: item.entrada ? "Asistio" : "Falto",
        hora_ingreso: item.entrada,
        tarde: !item.entrada ? "" : tarde >= 0 ? "No" : tarde,
      };
    });

    const updateDnis =
      trabajadorTieneAsistencia.length > 0 &&
      trabajadorTieneAsistencia.map((item) => item.trabajador_id);

    const updateAsistencia = asistenciasFechaActualExcel.filter((item1) =>
      trabajadorTieneAsistencia.some(
        (item2) => item1.trabajador_id === item2.dni
      )
    );

    // asistencia de solo trabajadores que existen en la bd si no tienen asistencia(crear)
    const update = updateAsistencia.filter((item1) =>
      filterContrato.some((item2) => item1.trabajador_id === item2.dni)
    );

    // asistencia de solo trabajadores que existen en la bd si no tienen asistencia(crear)
    const create = asistenciasFechaActualExcel.filter((item1) =>
      filterContrato.some((item2) => item1.trabajador_id === item2.dni)
    );

    if (update.length > 0) {
      const asistenciaTrabajadores = await trabajadorAsistencia.update(update, {
        where: { trabajador_id: updateDnis },
      });
    }

    if (create.length > 0) {
      const asistenciaTrabajadores = await trabajadorAsistencia.bulkCreate(
        create
      );
    }

    res.status(200).json({
      msg: "Se registraron las asistencias exitosamente!",
      status: 200,

    });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "No se pudo registrar las asistencias.",
      status: 500,
    });
  }
};

const getTrabajadorAsistencia = async (req, res, next) => {
  let id = req.params.id;

  try {
    const get = await trabajador.findAll({
      include: [
        {
          model: trabajadorAsistencia,
          // where: { asistencia_id: id },
          attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
        },
        {
          model: evaluacion,
          include: [
            { model: contratoEvaluacion },
            // { model: contrato, attributes: { exclude: ["contrato_id"] } },
          ],
        },
      ],
    });
    const filterDeshabilitado = get.filter(
      (item) => item.deshabilitado !== true
    );
    const filterIfEvaluacion = filterDeshabilitado.filter(
      (item) => item.evaluacions.length !== 0
    );

    const jsonFinal = filterIfEvaluacion.map((item) => {
      return {
        dni: item.dni,
        codigo_trabajador: item.codigo_trabajador,
        fecha_nacimiento: item.fecha_nacimiento,
        telefono: item.telefono,
        apellido_paterno: item.apellido_paterno,
        apellido_materno: item.apellido_materno,
        nombre: item.nombre,
        email: item.email,
        estado_civil: item.estado_civil,
        genero: item.genero,
        asociacion_id: item.asociacion_id,
        trabajador_asistencia: item.trabajador_asistencia.filter(
          (item) => item.asistencia_id == id
        ),
        // contrato: item?.evaluacions[item.evaluacions.length - 1]?.contratos,
        contrato_evaluacion:
          item?.evaluacions[item.evaluacions.length - 1]?.contrato_evaluacions,
      };
    });

    // const filterFinal = jsonFinal.filter((item) => item.contrato.length > 0);

    res.status(200).json({ data: jsonFinal });
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
    hora_ingreso: req.body.hora_ingreso,
  };

  try {
    const all = await asistencia.findAll({ raw: true });

    const filter = all.filter((item) => item.fecha === info.fecha);

    if (filter.length > 0) {
      res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
      next();
    } else if (filter.length === 0) {
      const asis = await asistencia.create(info);
      res.status(200).json({ msg: "Se añadio correctamente.", status: 200 });
      next();
    }
  } catch (error) {
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
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
      attributes: { exclude: ["trabajadorDni", "asistenciumId"] },

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
      res.status(200).json({ msg: "Actualizado con éxito!", status: 200 });
    } else if (!getAsistencia) {
      const createAsistencia = await trabajadorAsistencia.create(info);
      res.status(200).json({ msg: "Creado con éxito!", status: 200 });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
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
    res.status(200).json({ msg: "Actualizado con éxito!", status: 200 });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const deleteAsistencia = async (req, res, next) => {
  let id = req.params.id;
  try {
    let delAsis = await asistencia.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Eliminada con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
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
  updateAsistencia,
};
