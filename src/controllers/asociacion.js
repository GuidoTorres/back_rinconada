const {
  asociacion,
  trabajador,
  contrato,
  evaluacion,
  campamento,
} = require("../../config/db");

const XLSX = require("xlsx");
const { Op } = require("sequelize");

const getAsociacion = async (req, res, next) => {
  try {
    const all = await asociacion.findAll({
      include: [
        { model: contrato,      attributes: { exclude: ["contrato_id"] },
        include: [{ model: campamento }] },
        {
          model: trabajador,
          include: [{ model: evaluacion }],
        },
      ],
    });

    const orderData = all.map((item) => {
      return {
        id: item.id,
        nombre: item.nombre,
        codigo: item.codigo,
        contrato: item.contratos.length !== 0 ? item.contratos : "",
        campamento: item.contratos
          .map((dat) => dat.campamento.nombre)
          .toString(),
        trabajador: item.trabajadors.length !== 0 ? item.trabajadors : "",
        evaluacion_id: item.trabajadors
          .map((data) => data.evaluacions.map((dat) => dat.id))
          .toString(),
      };
    });

    res.status(200).json({ data: orderData });
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

      include: [{ model: contrato }, { model: trabajador }],
    });

    const obj = all.map((item) => {
      return {
        id: item.id,
        nombre: item.nombre,
        codigo: item.nombre,
        contrato: item.contratos.map((item) => {
          return {
            id: item.id,
            area: item.area,
            asociacion_id: item.asociacion_id,
            base: item.base,
            campamento_id: item.campamento_id,
            codigo_contrato: item.codigo_contrato,
            condicion_cooperativa: item.condicion_cooperativa,
            cooperativa: item.cooperativa,
            empresa_id: item.empresa_id,
            fecha_fin: item.fecha_fin,
            fecha_inicio: item.fecha_inicio,
            gerencia: item.gerencia,
            id: item.id,
            jefe_directo: item.jefe_directo,
            nota_contrato: item.nota_contrato,
            periodo_trabajo: item.periodo_trabajo,
            puesto: item.puesto,
            recomendado_por: item.recomendado_por,
            termino_contrato: item.termino_contrato,
            tipo_contrato: item.tipo_contrato,
          };
        }),
        trabajador: item.trabajadors,
      };
    });

    const resultJson = obj.filter(item => item.contrato.length !== 0)

    res.status(200).json({ data: resultJson });
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
    res
      .status(200)
      .json({ msg: "Asociacion actualizado con exito", rspta: update });
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
