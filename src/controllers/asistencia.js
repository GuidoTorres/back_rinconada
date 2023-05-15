const {
  asistencia,
  contrato,
  campamento,
  evaluacion,
  trabajador,
  trabajadorAsistencia,
  trabajador_contrato,
} = require("../../config/db");
const XLSX = require("xlsx");
const { Op, Sequelize } = require("sequelize");
const dayjs = require("dayjs");

const getAsistencia = async (req, res, next) => {
  try {
    const all = await asistencia.findAll();
    return res.status(200).json({ data: all });
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
    return res.status(200).json({ msg: "Actualizado con éxito!", status: 200 });
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
    const fecha = dayjs(req.body.fecha, "YYYY-MM-DD").format("YYYY-MM-DD");
    // const fechaBd = dayjs(fechaActual).format("YYYY-MM-DD");

    //para darle un formato usable a la data del excel
    const jsonFormat = result.slice(3).map((item, i) => {
      return {
        dni: item.Reporte_de_Excepciones,
        nombre: item.__EMPTY,
        fecha: dayjs(item.__EMPTY_2, [
          "YYYY-MM-DD",
          "DD-MM-YYYY",
          "MM-DD-YYYY",
        ]).format("YYYY-MM-DD"),
        entrada: item.__EMPTY_3 === undefined ? "" : item.__EMPTY_3,
        salida: item.__EMPTY_4 === undefined ? "" : item.__EMPTY_4,
      };
    });
    //obtengo solo las asistencias del dia actual que se encuentran en el excel
    const asistenciaExcelDiaActual = jsonFormat.filter(
      (item) => item.fecha === fecha
    );
    //creo array de dnis para hacer busqueda
    const dni = jsonFormat.map((item) => item.dni).flat();
    const filtereDni = [...new Set(dni)];
    //obtener el id de la fecha para la asistencia
    const idAsistencia = await asistencia.findAll({
      //aqui fechaBD
      where: { fecha: fecha },
    });

    //todos los trabajadores con dni del excel
    const getTrabajadores = await trabajador.findAll({
      attributes: { exclude: ["usuarioId"] },
      where: { deshabilitado: { [Op.not]: true } },
      include: [
        {
          model: trabajadorAsistencia,
          // where: { asistencia_id: id },
          attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
        },
        {
          model: trabajador_contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [
            {
              model: contrato,
              where: {
                finalizado: { [Op.not]: true },
                suspendido: { [Op.not]: true },
              },
              attributes: { exclude: ["contrato_id"] },
            },
          ],
        },
      ],
    });
    const getAsistenciaId = await asistencia.findAll({
      where: { fecha: fecha },
    });
    const idFechaAsistencia = parseInt(getAsistenciaId.map((item) => item.id));

    let hora_bd = idAsistencia.map((item) => item.hora_ingreso).toString();
    const trabajadorTieneAsistencia = await trabajadorAsistencia.findAll({
      attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
      where: { trabajador_id: filtereDni, asistencia_id: idFechaAsistencia },
    });
    //json con formato para guardar en la db de todos los trabajadores del excel
    const guardarTrabajadores = asistenciaExcelDiaActual.map((item) => {
      const fecha = "2023-04-20T";
      const fecha_hora_bd = new Date(fecha + hora_bd);
      const fecha_entrada = new Date(fecha + item.entrada);
      const diferencia_minutos =
        (fecha_hora_bd.getTime() - fecha_entrada.getTime()) / 60000;
      const umbral_tardanza = 15;
      const decimalTime = item.entrada;
      const hours = Math.floor(decimalTime * 24);
      const minutes = Math.floor((decimalTime * 24 - hours) * 60);

      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      return {
        asistencia_id: idFechaAsistencia,
        trabajador_id: item.dni.toString(),
        asistencia: item.entrada ? "Asistio" : "Falto",
        hora_ingreso: timeString,
        tarde: diferencia_minutos > umbral_tardanza ? "Si" : "No",
      };
    });

    const trabajadoresAsistencia = guardarTrabajadores.reduce(
      (acumulador, item) => {
        const tieneAsistencia = trabajadorTieneAsistencia.some(
          (asistencia) => asistencia.trabajador_id === item.trabajador_id
        );
        if (tieneAsistencia) {
          acumulador.conAsistencia.push(item);
        } else {
          acumulador.sinAsistencia.push(item);
        }

        return acumulador;
      },
      { conAsistencia: [], sinAsistencia: [] }
    );

    let responseMessages = [];

    const conAsistencia = trabajadoresAsistencia.conAsistencia.length;
    const sinAsistencia = trabajadoresAsistencia.sinAsistencia.length;
    if (trabajadoresAsistencia.conAsistencia.length > 0) {
      // Actualizar asistencias de trabajadores con asistencia existente
      await Promise.all(
        trabajadoresAsistencia.conAsistencia.map(async (trabajador) => {
          await trabajadorAsistencia.update(
            {
              asistencia: trabajador.asistencia,
              hora_ingreso: trabajador.hora_ingreso,
              tarde: trabajador.tarde,
            },
            {
              where: {
                trabajador_id: trabajador.trabajador_id,
                asistencia_id: idFechaAsistencia,
              },
            }
          );
        })
      );
      responseMessages.push(`Se actualizó ${conAsistencia} asistencia(s).`);
    }

    if (trabajadoresAsistencia?.sinAsistencia.length > 0) {
      // Crear nuevas asistencias para trabajadores sin asistencia existente
      await trabajadorAsistencia.bulkCreate(
        trabajadoresAsistencia.sinAsistencia
      );
      responseMessages.push(`Se añadió ${sinAsistencia} asistencia(s).`);
    }
    let responseMessage;
    if (responseMessages.length === 0) {
      responseMessage =
        "No se encontraron registros de asistencia para esta fecha.";
      return res.status(500).json({
        msg: responseMessage,
        status: 500,
      });
    } else if (responseMessages.length === 1) {
      responseMessage = responseMessages[0];
    } else {
      responseMessage = responseMessages.join("      \n ");
    }

    return res.status(200).json({
      msg: responseMessage,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hubo un error al registrar las asistencias.",
      status: 500,
    });
  }
};

const getTrabajadorAsistencia = async (req, res, next) => {
  let id = req.params.id;
  try {
    const get = await trabajador.findAll({
      attributes: { exclude: ["usuarioId"] },
      where: { deshabilitado: { [Op.not]: true } },
      include: [
        {
          model: trabajadorAsistencia,
          // where: { asistencia_id: id },
          attributes: { exclude: ["trabajadorDni", "asistenciumId"] },
        },
        {
          model: trabajador_contrato,
          include: [
            {
              model: contrato,
              where: {
                finalizado: false,
                suspendido: false,
              },
              attributes: { exclude: ["contrato_id"] },
            },
          ],
        },
      ],
    });
    const filterContrato = get.filter(
      (item) => item.trabajador_contratos.length > 0
    );

    const jsonFinal = filterContrato
      ?.map((item, i) => {
        return {
          dni: item?.dni,
          codigo_trabajador: item?.codigo_trabajador,
          fecha_nacimiento: item?.fecha_nacimiento,
          telefono: item?.telefono,
          apellido_paterno: item?.apellido_paterno,
          apellido_materno: item?.apellido_materno,
          nombre: item?.nombre,
          email: item?.email,
          estado_civil: item?.estado_civil,
          genero: item?.genero,
          asociacion_id: item?.asociacion_id,
          trabajador_asistencia: item?.trabajador_asistencia?.filter(
            (item) => parseInt(item.asistencia_id) === parseInt(id)
          ),
        };
      })
      .sort((a, b) => {
        // Si a.asociacion_id es nulo o vacío, lo coloca al principio
        if (!a.asociacion_id) {
          return -1;
        }
        // Si b.asociacion_id es nulo o vacío, lo coloca al final
        if (!b.asociacion_id) {
          return 1;
        }
        // Si ambos son nulos o vacíos, no los mueve de posición
        if (!a.asociacion_id && !b.asociacion_id) {
          return 0;
        }
        // Si ambos tienen un valor de asociacion_id, los compara numéricamente
        return a.asociacion_id - b.asociacion_id;
      });
    const finalConId = jsonFinal.map((item, i) => {
      return { id: i + 1, ...item };
    });

    return res.status(200).json({ data: finalConId });
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
          where: { finalizado: false, suspendido: false },
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
    return res.status(200).json({ data: filterAsistencia });
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
      return res
        .status(500)
        .json({ msg: "No se pudo registrar.", status: 500 });
    } else if (filter.length === 0) {
      const asis = await asistencia.create(info);
      return res
        .status(200)
        .json({ msg: "Se añadio correctamente.", status: 200 });
    }
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};
const postTrabajadorAsistencia = async (req, res, next) => {
  const info = {
    asistencia_id: req.body.asistencia_id,
    trabajador_id: req.body.trabajador_id,
    asistencia: req.body.asistencia,
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

    const asistenciaData = await asistencia.findOne({
      where: { id: info.asistencia_id },
    });

    if (!asistenciaData) {
      return res
        .status(404)
        .json({ msg: "La asistencia no existe", status: 404 });
    }

    const fechaAsistencia = new Date(asistenciaData.fecha);
    const fechaActual = new Date();
    const diferenciaDias =
      (fechaActual.getTime() - fechaAsistencia.getTime()) / (1000 * 3600 * 24);

    // if (diferenciaDias > 30) {
    //   return res.status(403).json({
    //     msg: "No se puede registrar la asistencia, han pasado más de 2 días.",
    //     status: 403,
    //   });
    // }

    if (getAsistencia) {
      const updateAsistencia = await trabajadorAsistencia.update(info, {
        where: {
          asistencia_id: info.asistencia_id,
          trabajador_id: info.trabajador_id,
        },
      });
      return res
        .status(200)
        .json({ msg: "Actualizado con éxito!", status: 200 });
    } else if (!getAsistencia) {
      const createAsistencia = await trabajadorAsistencia.create(info);
      return res.status(200).json({ msg: "Registrada con éxito!", status: 200 });
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
    return res.status(200).json({ msg: "Actualizado con éxito!", status: 200 });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const deleteAsistencia = async (req, res, next) => {
  let id = req.params.id;
  try {
    let delAsisTrabajador = trabajadorAsistencia.destroy({
      where: { asistencia_id: id },
    });
    let delAsis = await asistencia.destroy({ where: { id: id } });
    return res.status(200).json({ msg: "Eliminada con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
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
