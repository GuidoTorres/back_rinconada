const { contrato_pago, pago, empresa, contrato } = require("../../config/db");

const getEmpresaPago = async (req, res, next) => {
  try {
    const get = await empresa.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [{ model: contrato_pago, include: [{ model: pago }] }],
        },
      ],
    });

    const formatData = get.map((item) => {
      return {
        id: item?.id,
        razon_social: item?.razon_social,
        ruc: item?.ruc,
        contrato_id: item?.contratos?.map((data) => data?.id)?.toString(),
        contrato_pago: item?.contratos
          ?.map((data) => data?.contrato_pagos)
          ?.flat()
          ?.sort((a, b) => a.id - b.id)
          ?.filter((item) => item?.pago?.estado !== true).at(-1),
      };
    });
    //       .at(-1)
    res.status(400).json({ data: formatData });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

const createProgramacionCasa = async (req, res, next) => {
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    estado: false,
    teletrans: req.body.teletrans,
    tipo: req.body.tipo,
  };

  try {
    const get = await contrato_pago.findAll({
      where: { contrato_id: req.body.contrato_id },
      include: [{ model: pago }],
    });

    const filterExist = get.filter((item) => item.pago.estado !== true);
    if (filterExist.length > 0) {
      return res.status(400).json({
        msg: "No se pudo registrar la programación del pago, tiene un pago pendiente.",
        status: 400,
      });
    } else {
      if (req.body.contrato_id) {
        if (parseInt(info.teletrans) % 4 !== 0) {
          return res.status(400).json({
            msg: "Error! La cantidad de teletrans debe ser equivalente a un volquete.",
            status: 400,
          });
        } else {
          const post = await pago.create(info);
          let contra_pago = {
            teletrans: info.teletrans,
            contrato_id: req.body.contrato_id,
            pago_id: post.id,
          };
          const pagoContrato = await contrato_pago.create(contra_pago);
          return res
            .status(200)
            .json({ msg: "Programación registrada con éxito!", status: 200 });
        }
      } else {
        return res.status(400).json({
          msg: "Error! Falta el id del contrato.",
          status: 400,
        });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

//para realizar el pago de trabajadores individuales, actualizar el saldo en la tabla teletrans
const postPagoCasa = async (req, res, next) => {
  let info = {
    hora: req?.body?.hora,
    placa: req?.body?.placa,
    propietario: req?.body?.propietario,
    trapiche: req.body?.trapiche,
    teletrans: parseInt(req.body?.teletrans),
    contrato_id: parseInt(req.body?.contrato_id),
    pago_id: parseInt(req.body.pago_id),
    estado: true,
  };

  try {
    if (req.body.teletrans % 4 === 0) {
      const create = await pago.update(info, {
        where: { id: info.pago_id },
      });
      return res
        .status(200)
        .json({ msg: "Pago registrado con éxito!", status: 200 });
    } else {
      return res.status(200).json({
        msg: "Error! el pago solamente se puede realizar si los teletrans equivalente a 1 o más volquetes.",
        status: 200,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

const updateProgramacionCasa = async (req, res, next) => {
  let id = req.params.id;
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    teletrans: req.body.teletrans,
  };
  try {
    if (info.teletrans % 4 === 0) {
      let update = await pago.update(info, { where: { id: id } });
      let data = {
        teletrans: info.teletrans,
      };
      let updateContatoPago = await contrato_pago.update(data, {
        where: { pago_id: id },
      });

      res
        .status(200)
        .json({ msg: "Programación actualizada con éxito!", status: 200 });
      next();
    } else {
      res.status(400).json({
        msg: "Error! La cantidad de teletrans debe ser equivalente a 1 o mas volquetes.",
        status: 400,
      });
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};
const deletePagoCasa = async (req, res, next) => {
  let id = req.params.id;
  try {
    let delContratoPago = await contrato_pago.destroy({
      where: { pago_id: id },
    });
    let del = await pago.destroy({ where: { id: id } });
    if (delContratoPago === 0 && del === 0) {
      return res
        .status(404)
        .json({ msg: "No se encontró el pago.", status: 404 });
    } else {
      return res
        .status(200)
        .json({ msg: "Pago eliminado con éxito!", status: 200 });
    }
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

module.exports = {
  createProgramacionCasa,
  postPagoCasa,
  updateProgramacionCasa,
  deletePagoCasa,
  getEmpresaPago,
};
