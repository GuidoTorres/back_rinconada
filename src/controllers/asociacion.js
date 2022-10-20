const { asociacion, trabajador, contrato } = require("../../config/db");

const XLSX = require("xlsx");
const { Op } = require("sequelize");

const getAsociacion = async (req, res, next) => {
  try {
    const all = await asociacion.findAll({
      include: [
        { model: trabajador, as: "trabajador", include: [{ model: contrato }] },
      ],
    });
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getAsociacionById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const all = await asociacion.findAll({
      where: { id: id },
      include: [{ model: contrato }],
    });

    const obj = all
      .filter((item) => item.contratos.length)
      .map((item) => {
        return {
          id: item.id,
          nombre: item.nombre,
          codigo: item.codigo,
          contrato: item.contratos,
          tipo_contrato: item.contratos.map((item) => item.tipo_contrato),
          fecha_inicio: item.contratos.map((item) => item.fecha_inicio),
          fecha_fin: item.contratos.map((item) => item.fecha_fin),
          nota_contrato: item.contratos.map((item) => item.nota_contrato),
        };
      });
    res.status(200).json({ data: obj });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const postAsociacion = async (req, res, next) => {
  let info = {
    nombre: req.body.nombre,
    codigo: req.body.codigo,
  };

  try {
    const camp = await asociacion.create(info);
    res.status(200).json({ data: camp });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateAsociacion = async (req, res, next) => {
  let id = req.params.id;

  try {
    let update = await asociacion.update(req.body, { where: { id: id } });
    res.status(200).json({ msg: "Asociacion actualizado con exito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteAsociacion = async (req, res, next) => {
  let id = req.params.id;
  try {
    let deletes = await asociacion.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Campamento eliminado con exito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const uploadFile = async (req, res, next) => {
  let id = req.params.id;

  try {
    const workbook = XLSX.readFile("./upload/data.xlsx");
    const workbookSheets = workbook.SheetNames;
    const sheet = workbookSheets[0];
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    const obj = dataExcel.map((item) => {
      return {
        dni: item.Dni,
        codigo_trabajador: item.codigo_trabajador,
        fecha_nacimiento: item.fecha_nacimiento,
        telefono: item.telefono,
        apellido_paterno: item.apellido_paterno,
        apellido_materno: item.apellido_materno,
        nombre: item.nombre,
        email: item.Email,
        estado_civil: item.estado_civil,
        genero: item.Genero,
        asociacion_id: id,
      };
    });

    const getTrabajador = await trabajador.findAll();
    const filtered = obj.filter(
      ({ dni, codigo_trabajador }) =>
        !getTrabajador.some((x) => x.dni == dni) && codigo_trabajador
    );

    const nuevoTrabajador = await trabajador.bulkCreate(filtered);

    const idsTrabajdores = nuevoTrabajador.map((item) => item.id);

    res
      .status(200)
      .send({ data: "Trabajadores creados con éxito", status: 200 });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getAsociacion,
  postAsociacion,
  updateAsociacion,
  deleteAsociacion,
  uploadFile,
  getAsociacionById,
};
