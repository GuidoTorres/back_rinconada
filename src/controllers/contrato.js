const {
  contrato,
  trabajador,
  evaluacion,
  teletrans,
} = require("../../config/db");
const date = require("date-and-time");
const { Op } = require("sequelize");

const getContrato = async (req, res, next) => {
  try {
    const get = await contrato.findAll({
      attributes: { exclude: ["contrato_id"] },
    });
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getContratoById = async (req, res, next) => {
  let id = req.params.id;
  // obtener contrato de trabajador con el id de trabajador
  try {
    const user = await trabajador.findAll({
      where: { dni: id },
      attributes: { exclude: ["usuarioId"] },
      include: [{ model: contrato, attributes: { exclude: ["contrato_id"] } }],
    });
    // const obj = user.map((item) => {
    //   return {
    //     id: item.id,
    //     contrato: item.evaluacions
    //       .map((data) => data.contrato_evaluacions)
    //       .flat(),
    //   };
    // });

    // const obj2 = obj
    //   .map((item) => item.contrato.map((data) => data.contrato))
    //   .flat();

    res.status(200).json({ data: user });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};
const getContratoAsociacionById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const user = await contrato.findAll({
      attributes: { exclude: ["contrato_id"] },
      where: { asociacion_id: id },
    });

    // const obj = user

    res.status(200).json({ data: user });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postContrato = async (req, res, next) => {
  try {
    if (req.body.trabajador_id) {
      const get = await contrato.findAll({
        where: { trabajador_id: req.body.trabajador_id },
        attributes: { exclude: ["contrato_id"] },
      });
      const getEva = await evaluacion.findAll({
        where: { trabajador_id: req.body.trabajador_id },
        attributes: { exclude: ["contrato_id"] },
      });
      const filter = get.filter((item) => item.finalizado === false);
      const filterEva = getEva.filter((item) => item.finalizado === false);
      if (filter.length > 0) {
        return res.status(500).json({
          msg: "No se pudo crear el contrato, el trabajador tiene un contrato activo.",
          status: 500,
        });
      } else {
        if (filterEva.length > 0) {
          const post = await contrato.create(req.body);

          let volquete = parseInt(req.body?.volquete);
          let teletran = parseInt(req.body?.teletran);
          let total = parseInt(volquete) * 4 + parseInt(teletran);

          const ttransInfo = {
            volquete: volquete,
            teletrans: teletran,
            total: total,
            saldo: total,
            contrato_id: post.id,
          };
          if (volquete !== "" && teletran !== "") {
            const createtTrans = await teletrans.create(ttransInfo);
          }
          return res
            .status(200)
            .json({ msg: "Contrato creado con éxito!", status: 200 });
        } else {
          return res.status(500).json({
            msg: "No se pudo registrar,el trabajador no tiene una evaluación activa.",
            status: 500,
          });
        }
      }
    } else {
      const post = await contrato.create(req.body);

      let volquete = parseInt(req.body?.volquete);
      let teletran = parseInt(req.body?.teletran);
      let total = parseInt(volquete) * 4 + parseInt(teletran);

      const ttransInfo = {
        volquete: volquete,
        teletrans: teletran,
        total: total,
        saldo: total,
        contrato_id: post.id,
      };
      if (volquete !== "" && teletran !== "") {
        const createtTrans = await teletrans.create(ttransInfo);
      }
      return res
        .status(200)
        .json({ msg: "Contrato creado con éxito!", status: 200 });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo crear el contrato.", status: 500 });
  }
};

// terminar
const postContratoAsociacion = async (req, res, next) => {
  let info = {
    fecha_inicio: req.body.fecha_inicio,
    codigo_contrato: req.body.codigo_contrato,
    tipo_contrato: req.body.tipo_contrato,
    recomendado_por: req.body.recomendado_por,
    cooperativa: req.body.cooperativa,
    condicion_cooperativa: req.body.condicion_cooperativa,
    periodo_trabajo: req.body.periodo_trabajo,
    fecha_fin: req.body.fecha_fin,
    gerencia: req.body.gerencia,
    area: req.body.area,
    jefe_directo: req.body.jefe_directo,
    base: req.body.base,
    termino_contrato: req.body.termino_contrato,
    nota_contrato: req.body.nota_contrato,
    puesto: req.body.puesto,
    campamento_id: req.body.campamento_id,
    asociacion_id: req.body.asociacion_id,
    evaluacion_id: req.body.evaluacion_id,
    volquete: req.body.volquete,
    teletran: req.body.teletran,
    suspendido: false,
    finalizado: false,
  };
  console.log(req.body.evaluacion_id);
  try {
    console.log(req.body);
    if (req.body.evaluacion_id.length > 0) {
      const post = await contrato.create(info);
      if (post) {
        let volquete = parseInt(req.body?.volquete);
        let teletran = parseInt(req.body?.teletran);
        let total = parseInt(volquete) * 4 + parseInt(teletran);

        const ttransInfo = {
          volquete: volquete,
          total: total,
          saldo: total,
          contrato_id: post.id,
        };
        const createtTrans = await teletrans.create(ttransInfo);
        res
          .status(200)
          .json({ msg: "Contrato creado con éxito!", status: 200 });
        next();
      }
    } else {
      res
        .status(200)
        .json({ msg: "Evaluación de trabajadores incompletas!", status: 401 });
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo crear el contrato.", status: 500 });
  }
};

const updateContrato = async (req, res, next) => {
  let id = req.params.id;

  try {
    const put = await contrato.update(req.body, {
      where: { id: id },
    });

    if (req?.body?.volquete && req?.body?.teletran) {
      let volquete = parseInt(req.body?.volquete);
      let teletran = parseInt(req.body?.teletran);
      let total = parseInt(volquete) * 4 + parseInt(teletran);

      console.log(volquete);
      const ttransInfo = {
        volquete: volquete,
        total: total,
        saldo: total,
        teletrans: teletran,
        contrato_id: id,
      };
      const createtTrans = await teletrans.update(ttransInfo, {
        where: { contrato_id: id },
      });
    }

    res
      .status(200)
      .json({ msg: "Contrato actualizado con éxito", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo actualizar el contrato.", status: 500 });
  }
};

const deleteContrato = async (req, res, next) => {
  let id = req.params.id;
  try {
    let removeTtrans = await teletrans.destroy({ where: { contrato_id: id } });
    let remove = await contrato.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Contrato eliminado con éxito", status: 200 });
    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "No se pudo eliminar el contrato", status: 500 });
  }
};

const getLastId = async (req, res, next) => {
  try {
    const get = await contrato.findOne({
      attributes: { exclude: ["contrato_id"] },
      order: [["id", "DESC"]],
    });

    const getId = get.id + 1 || 0;
    res.status(200).json({ data: getId });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo obtener", status: 500 });
  }
};

module.exports = {
  getContrato,
  updateContrato,
  postContrato,
  deleteContrato,
  getContratoById,
  postContratoAsociacion,
  getContratoAsociacionById,
  getLastId,
};
