const {
  contrato,
  trabajador,
  evaluacion,
  teletrans,
  trabajador_contrato,
} = require("../../config/db");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

const getContrato = async (req, res, next) => {
  try {
    const get = await contrato.findAll({
      attributes: { exclude: ["contrato_id"] },
    });
    return res.status(200).json({ data: get });
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
      include: [
        {
          model: trabajador_contrato,
          include: [
            {
              model: contrato,
              finalizado: { [Op.not]: true },
              attributes: { exclude: ["contrato_id"] },
            },
          ],
        },
        { model: evaluacion, finalizado: { [Op.not]: true } },
      ],
    });

    const format = user.map((item) => {
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
        direccion: item?.direccion,
        asociacion_id: item?.asociacion_id,
        deshabilitado: item?.deshabilitado,
        foto: item?.foto,
        suspendido: item?.suspendido,
        contratos: item.trabajador_contratos.map((data) => {
          return {
            id: data?.contrato_id,
            codigo_contrato: data?.contrato_id,
            fecha_inicio_tabla: dayjs(data?.contrato?.fecha_inicio)?.format(
              "DD-MM-YYYY"
            ),
            fecha_fin_tabla: dayjs(data?.contrato?.fecha_fin)?.format(
              "DD-MM-YYYY"
            ),
            fecha_inicio: dayjs(data?.contrato?.fecha_inicio)?.format(
              "YYYY-MM-DD"
            ),
            fecha_fin: dayjs(data?.contrato?.fecha_fin)?.format("YYYY-MM-DD"),
            codigo_contrato: data?.contrato?.codigo_contrato,
            tipo_contrato: data?.contrato?.tipo_contrato,
            periodo_trabajo: data?.contrato?.periodo_trabajo,
            gerencia_id: data?.contrato?.gerencia_id,
            area_id: data?.contrato?.area_id,
            puesto_id: data?.contrato?.puesto_id,
            jefe_directo: data?.contrato?.jefe_directo,
            base: data?.contrato?.base,
            termino_contrato: data?.contrato?.termino_contrato,
            nota_contrato: data?.contrato?.nota_contrato,
            campamento_id: data?.contrato?.campamento_id,
            asociacion_id: data?.contrato?.asociacion_id,
            estado: data?.contrato?.estado,
            volquete: data?.contrato?.volquete,
            teletran: data?.contrato?.teletran,
            suspendido: data?.contrato?.suspendido,
            finalizado: data?.contrato?.finalizado,
            trabajador_id: data?.contrato?.trabajador_id,
            tareo: data?.contrato?.tareo,
            suspendido: data?.contrato?.suspendido,
          };
        }),
        evaluacion: item.evaluacions.at(0),
      };
    });

    return res.status(200).json({ data: format });

    next();
  } catch (error) {
    console.log(error);
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

    const format = user.map((item) => {
      return {
        id: item?.id,
        fecha_inicio_tabla: dayjs(item?.fecha_inicio)?.format("DD-MM-YYYY"),
        fecha_inicio: dayjs(item?.fecha_inicio)?.format("YYYY-MM-DD"),
        fecha_fin_tabla: dayjs(item?.fecha_fin)?.format("DD-MM-YYYY"),
        fecha_fin: dayjs(item?.fecha_fin)?.format("YYYY-MM-DD"),
        codigo_contrato: item?.codigo_contrato,
        tipo_contrato: item?.tipo_contrato,
        periodo_trabajo: item?.periodo_trabajo,
        fecha_fin: item?.fecha_fin,
        gerencia_id: item?.gerencia_id,
        area_id: item?.area_id,
        jefe_directo: item?.jefe_directo,
        base: item?.base,
        termino_contrato: item?.termino_contrato,
        nota_contrato: item?.nota_contrato,
        puesto: item?.puesto,
        campamento_id: item?.campamento_id,
        empresa_id: item?.empresa_id,
        asociacion_id: item?.asociacion_id,
        estado: item?.estado,
        volquete: item?.volquete,
        teletran: item?.teletran,
        suspendido: item?.suspendido,
        finalizado: item?.finalizado,
        tareo: item?.tareo,
      };
    });

    return res.status(200).json({ data: format });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postContrato = async (req, res, next) => {
  try {
    if (req.body.trabajador_id) {
      const get = await trabajador_contrato.findAll({
        where: { trabajador_dni: req.body.trabajador_id },
        include: [
          {
            model: contrato,
            attributes: { exclude: ["contrato_id", "trabajador_id"] },
          },
        ],
      });
      const getEva = await evaluacion.findAll({
        where: { trabajador_id: req.body.trabajador_id },
        attributes: { exclude: ["contrato_id"] },
      });
      const filter = get
        .map((item) => item.contrato)
        .filter((item) => item.finalizado === false);
      const filterEva = getEva.filter((item) => item.finalizado === false);
      if (filter.length > 0) {
        return res.status(500).json({
          msg: "No se pudo crear el contrato, el trabajador tiene un contrato activo.",
          status: 500,
        });
      } else {
        if (filterEva.length > 0) {
          const post = await contrato.create(req.body);

          const contraPago = {
            contrato_id: post.id,
            trabajador_dni: req.body.trabajador_id,
          };

          const createContraPago = await trabajador_contrato.create(contraPago);

          let volquete = parseInt(req.body?.volquete) || 0;
          let teletran = parseInt(req.body?.teletran) || 0;
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
    fecha_inicio: dayjs(req?.body?.fecha_inicio)?.format("YYYY-MM-DD"),
    codigo_contrato: req?.body?.codigo_contrato,
    tipo_contrato: req?.body?.tipo_contrato,
    recomendado_por: req?.body?.recomendado_por,
    cooperativa: req?.body?.cooperativa,
    condicion_cooperativa: req?.body?.condicion_cooperativa,
    periodo_trabajo: req?.body?.periodo_trabajo,
    fecha_fin: dayjs(req?.body?.fecha_fin)?.format("YYYY-MM-DD"),
    gerencia_id: req?.body?.gerencia_id,
    area_id: req?.body?.area_id,
    jefe_directo: req?.body?.jefe_directo,
    base: req?.body?.base,
    termino_contrato: req?.body?.termino_contrato,
    nota_contrato: req?.body?.nota_contrato,
    puesto_id: req?.body?.puesto_id,
    campamento_id: req?.body?.campamento_id,
    asociacion_id: req?.body?.asociacion_id,
    evaluacion_id: req?.body?.evaluacion_id,
    volquete: req?.body?.volquete,
    teletran: req?.body?.teletran,
    suspendido: false,
    finalizado: false,
    tareo: req?.body?.tareo,
  };
  try {
    if (req.body.trabajadores.length > 0) {
      const post = await contrato.create(info);
      const contraPago = req?.body?.trabajadores?.map((item) => {
        return {
          trabajador_dni: item,
          contrato_id: post.id,
        };
      });

      const createContraPago = await trabajador_contrato.bulkCreate(
        contraPago,
        {
          ignoreDuplicates: false,
        }
      );
      if (post) {
        let volquete = parseFloat(req.body?.volquete);
        let teletran = parseFloat(req.body?.teletran);
        let total = parseFloat(volquete) * 4 + parseFloat(teletran);

        const ttransInfo = {
          volquete: volquete,
          total: total,
          saldo: total,
          contrato_id: post.id,
        };
        const createtTrans = await teletrans.create(ttransInfo);
        return res
          .status(200)
          .json({ msg: "Contrato creado con éxito!", status: 200 });
      }
    } else {
      return res
        .status(200)
        .json({ msg: "Evaluación de trabajadores incompletas!", status: 401 });
    }
    next();
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
      let volquete = parseFloat(req.body?.volquete);
      let teletran = parseFloat(req.body?.teletran);
      let total = parseFloat(volquete) * 4 + parseFloat(teletran);

      const ttransInfo = {
        volquete: volquete.toString(),
        total: total.toString(),
        saldo: total.toString(),
        teletrans: teletran.toString(),
        contrato_id: id,
      };
      const createtTrans = await teletrans.update(ttransInfo, {
        where: { contrato_id: id },
      });
    }
    if (req.body.suspendido) {
      // Obtener el trabajador asociado al contrato
      const trabajadorContrato = await trabajador_contrato.findOne({ where: { contrato_id: id } });
      console.log(trabajadorContrato);
      // Si existe una relación trabajador_contrato
      if (trabajadorContrato) {
        // Obtener el trabajador asociado al contrato
        const trabajadorSuspendido = await trabajador.findOne({
          where: { dni: trabajadorContrato.trabajador_dni },
          attributes: { exclude: ["usuarioId"] },
        });
    
        // Actualizar el campo 'finalizado' en la tabla de contrato activo
        await contrato.update({ suspendido: true, finalizado: true }, { where: { id: id, finalizado: false } });
    
        // Actualizar las evaluaciones activas relacionadas con el trabajador
        await evaluacion.update({ suspendido: true, finalizado: true }, { where: { trabajador_id: trabajadorSuspendido.dni, finalizado: false } });
      }
    }

    return res
      .status(200)
      .json({ msg: "Contrato actualizado con éxito!", status: 200 });
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
    let removeTrabajadorContrato = await trabajador_contrato.destroy({
      where: { contrato_id: id },
    });
    let remove = await contrato.destroy({ where: { id: id } });
    return res
      .status(200)
      .json({ msg: "Contrato eliminado con éxito", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "No se pudo eliminar el contrato", status: 500 });
  }
};

const getLastId = async (req, res, next) => {
  const dniTrabajador = req.params.id;

  try {
    const contratos = await trabajador_contrato.findAll({
      where: { trabajador_dni: dniTrabajador },
      include: [
        {
          model: contrato,
          order: [["id", "DESC"]],
          attributes: { exclude: ["contrato_id"] },
        },
      ],
    });
    console.log(contratos?.at(0)?.contrato.codigo_contrato);
    const nuevoId =
      contratos.length > 0
        ? parseInt(contratos?.at(0)?.contrato.codigo_contrato) + 1
        : 1;
    return res.status(200).json({ data: nuevoId });
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
