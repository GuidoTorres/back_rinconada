const {
  asociacion,
  trabajador,
  contrato,
  evaluacion,
  campamento,
} = require("../../config/db");

const XLSX = require("xlsx");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

const getAsociacion = async (req, res, next) => {
  try {
    const all = await asociacion.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: "contrato_id" },
          include: [{ model: campamento }],
        },
        {
          model: trabajador,
          attributes: { exclude: ["usuarioId"] },
          include: [{ model: evaluacion }],
        },
      ],
    });

    const formatData = all.map((item) => {
      return {
        id: item?.id,
        nombre: item?.nombre,
        codigo: item?.codigo,
        tipo: item?.tipo,
        campamento: item.contratos
          .map((data) => data.campamento.nombre)
          .toString(),
        contrato: item.contratos
          .map((data) => {
            return {
              id: data.id,
              area: data.area,
              asociacion_id: data.asociacion_id,
              base: data.base,
              campamento: data.campamento.nombre,
              codigo_contrato: data.codigo_contrato,
              condicion_cooperativa: data.condicion_cooperativa,
              cooperativa: data.cooperativa,
              empresa_id: data.empresa_id,
              fecha_fin: dayjs(data.fecha_fin).format("YYYY-MM-DD"),
              fecha_inicio: dayjs(data.fecha_inicio).format("YYYY-MM-DD"),
              gerencia: data.gerencia,
              id: data.id,
              jefe_directo: data.jefe_directo,
              nota_contrato: data.nota_contrato,
              periodo_trabajo: data.periodo_trabajo,
              puesto: data.puesto,
              recomendado_por: data.recomendado_por,
              termino_contrato: data.termino_contrato,
              tipo_contrato: data.tipo_contrato,
              finalizado: data.finalizado,
            };
          })
          .filter((item) => item.finalizado === false),
        trabajadors: item.trabajadors
          .map((data) => {
            return {
              dni: data.dni,
              codigo_trabajador: data.codigo_trabajador,
              campamento: item.contratos
                .map((data) => data.campamento.nombre)
                .toString(),
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
              evaluacions: data.evaluacions.filter(
                (dat) => dat.finalizado === false
              ),
            };
          })
          .sort((a, b) =>
            a.codigo_trabajador.localeCompare(b.codigo_trabajador)
          ),
      };
    });

    return res.status(200).json({ data: formatData });
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

      include: [
        { model: contrato },
        { model: trabajador, include: [{ model: evaluacion }] },
      ],
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
            fecha_fin: dayjs(item.fecha_fin).format("YYYY-MM-DD"),
            fecha_inicio: dayjs(item.fecha_inicio).format("YYYY-MM-DD"),
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

    return res.status(200).json({ data: resultJson });
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
    return res
      .status(200)
      .json({ msg: "Asociación creada con éxito!", status: 200 });
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
    return res
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
    return res
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
  try {
    const workbook = XLSX.readFile("./upload/data.xlsx");
    const workbookSheets = workbook.SheetNames;
    const sheet = workbookSheets[0];
    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    const result = dataExcel
      .map((v) =>
        Object.entries(v).reduce(
          (acc, [key, value]) =>
            Object.assign(acc, { [key.replace(/\s+/g, "_")]: value }),
          {}
        )
      )
      .filter((item) => !isNaN(item.dni) && item.dni.toString().length === 8);

    const getCodigoTrabajador = await trabajador.findOne({
      attributes: { exclude: ["usuarioId"] },
      order: [["codigo_trabajador", "DESC"]],
    });

    const codigo_final = getCodigoTrabajador?.codigo_trabajador || "CCMRL00000";
    const getNumber = codigo_final.includes("CCMRL0000")
      ? codigo_final.split("CCMRL0000")[1]
      : codigo_final.includes("CCMRL000")
      ? codigo_final.split("CCMRL000")[1]
      : codigo_final.includes("CCMRL00")
      ? codigo_final.split("CCMRL00")[1]
      : codigo_final.includes("CCMRL0")
      ? codigo_final.split("CCMRL0")[1]
      : codigo_final.includes("CCMRL")
      ? codigo_final.split("CCMRL")[1]
      : "";

    const obj = result
      .map((item, i) => {
        return {
          dni: item?.dni,
          codigo_trabajador:
            parseInt(getNumber) + i + 1 < 10
              ? "CCMRL0000" + (parseInt(getNumber) + i + 1)
              : parseInt(getNumber) + i + 1 > 9 &&
                parseInt(getNumber) + i + 1 < 100
              ? "CCMRL000" + (parseInt(getNumber) + i + 1)
              : parseInt(getNumber) + i + 1 > 99 &&
                parseInt(getNumber) + i + 1 < 1000
              ? "CCMRL00" + (parseInt(getNumber) + i + 1)
              : parseInt(getNumber) + i + 1 > 999 &&
                parseInt(getNumber) + i + 1 < 10000
              ? "CCMRL0" + (parseInt(getNumber) + i + 1)
              : "CCMRL" + (parseInt(getNumber) + i + 1),
          fecha_nacimiento: dayjs(
            new Date(item.fecha_nacimiento.replace(/(\d+[/])(\d+[/])/, "$2$1"))
          ).format("YYYY-MM-DD"),
          telefono: item?.telefono,
          apellido_paterno: item?.apellido_paterno,
          apellido_materno: item?.apellido_materno,
          nombre: item?.nombre,
          email: item?.email,
          estado_civil: item?.estado_civil,
          genero: item?.genero,
          asociacion_id: item?.asociacion_id,
          direccion: item?.direccion,
        };
      })
      .filter((item) => item.asociacion_id !== undefined);
      console.log("prueba");
    const unique = obj.reduce((acc, current) => {
      if (!acc.find((ele) => ele.dni === current.dni)) {
        acc.push(current);
      }

      return acc;
    }, []);

    // const getTrabajador = await trabajador.findAll({
    //   attributes: { exclude: ["usuarioId"] },
    // });

    // //filtrar a los trabajadores que ya estan registrados en la bd
    // const filtered = unique.filter(
    //   ({ dni }) => !getTrabajador.some((x) => x.dni == dni)
    // );

    // //listado de dnis del excel
    // const dnis = filtered.map((item) => item.dni);
    // console.log(dnis);
    // // filtrar
    // const filterDni = filtered.filter(
    //   ({ dni }, index) => !dnis.includes(dni, index + 1)
    // );
    // console.log(filterDni);
    if (unique.length !== 0) {
      const nuevoTrabajador = await trabajador.bulkCreate(unique, {
        updateOnDuplicate: [
          "fecha_nacimiento",
          "telefono",
          "email",
          "apellido_paterno",
          "apellido_materno",
          "nombre",
          "email",
          "estado_civil",
          "direccion",
        ],
      });
      return res.status(200).json({
        msg: `Se registraron ${unique.length} trabajadores con éxito!`,
        status: 200,
      });
    } else {
      return res
        .status(200)
        .json({ msg: "No se pudo registrar a los trabajadores!", status: 500 });
    }
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo registrar a los trabajadores!", status: 500 });
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
