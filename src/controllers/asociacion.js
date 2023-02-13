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
        {
          model: trabajador,
          attributes: { exclude: ["usuarioId"] },
          include: [{ model: evaluacion }],
        },
      ],
    });

    const orderData = all.map((item) => {
      return {
        id: item?.id,
        nombre: item?.nombre,
        codigo: item?.codigo,
        tipo: item?.tipo,
        trabajadors: item.trabajadors.map((data) => {
          return {
            dni: data.dni,
            codigo_trabajador: data.codigo_trabajador,
            fecha_nacimiento: data.fecha_nacimiento,
            telefono: data.telefono,
            nombre: data.nombre,
            apellido_paterno: data.apellido_paterno,
            apellido_materno: data.apellido_materno,
            email: data.email,
            estado_civil: data.estado_civil,
            genero: data.genero,
            direccion: data.direccion,
            asociacion_id: data.asociacion_id,
            deshabilitado: data.deshabilitado,
            foto: data.foto,
            eliminar: data.eliminar,
            evaluacions: data.evaluacions[data.evaluacions.length - 1],
          };
        }),
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
        tipo: item.tipo,
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

    const resultJson = obj.filter((item) => item.contrato.length !== 0);

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
    tipo: req.body.tipo,
  };

  try {
    const camp = await asociacion.create(info);
    res.status(200).json({ msg: "Asociación creada con éxito!", status: 200 });
    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "No se pudo crear la asociación.", status: 500 });
  }
};

const updateAsociacion = async (req, res, next) => {
  let id = req.params.id;

  try {
    let update = await asociacion.update(req.body, { where: { id: id } });
    res
      .status(200)
      .json({ msg: "Asociacion actualizada con éxito!", status: 200 });
    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "No se pudo actualizar la asociación.", status: 500 });
  }
};

const deleteAsociacion = async (req, res, next) => {
  let id = req.params.id;
  try {
    let deletes = await asociacion.destroy({ where: { id: id } });
    res
      .status(200)
      .json({ msg: "Asociación eliminada con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo eliminar la asociación.", status: 500 });
  }
};

const uploadFile = async (req, res, next) => {
  let id = req.params.id;
  console.log(req.file);
  try {
    const workbook = XLSX.readFile("./upload/asociacion.xlsx");
    const workbookSheets = workbook.SheetNames;
    const sheet = workbookSheets[0];
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    const result = dataExcel
      .slice(1)
      .map((v) =>
        Object.entries(v).reduce(
          (acc, [key, value]) =>
            Object.assign(acc, { [key.replace(/\s+/g, "_")]: value }),
          {}
        )
      );

    const obj = result.map((item) => {
      return {
        dni: parseInt(item?.dni),
        codigo_trabajador: item?.codigo_trabajador,
        fecha_nacimiento: item?.fecha_nacimiento,
        telefono: item?.telefono,
        apellido_paterno: item?.apellido_paterno,
        apellido_materno: item?.apellido_materno,
        nombre: item?.nombre,
        email: item?.email,
        estado_civil: item?.estado_civil,
        genero: item?.genero,
        asociacion_id: id,
      };
    });
    console.log(obj);

    const getTrabajador = await trabajador.findAll({attributes:{exclude:["usuarioId"]}});
    const filtered = obj.filter(
      ({ dni, codigo_trabajador }) =>
        !getTrabajador.some((x) => x.dni == dni) && codigo_trabajador
    );

    const dnis = filtered.map((item) => item.dni);
    const filterDni = filtered.filter(
      ({ dni }, index) => !dnis.includes(dni, index + 1)
    );

    const nuevoTrabajador = await trabajador.bulkCreate(filterDni);
    res
      .status(200)
      .send({ data: "Trabajadores creados con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ data: "No se pudo registrar los trabajadores", status: 500 });
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
