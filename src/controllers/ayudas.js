const {
  trabajador,
  contrato_pago,
  pago,
  ayuda_pago,
} = require("../../config/db");

const getTrabajadorAyuda = async (req, res, next) => {
  try {
    const all = await trabajador.findAll({
      attributes: { exclude: ["usuarioId"] },
    });
    const formatData = all.map((item) => {
      return {
        dni: item.dni,
        codigo_trabajador: item.codigo_trabajador,
        nombre:
          item.nombre +
          " " +
          item.apellido_paterno +
          " " +
          item.apellido_materno,
      };
    });
    res.status(200).json({ data: formatData });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const createProgramacionAyuda = async (req, res, next) => {
  let info = {
    observacion: req.body.observacion,
    fecha_pago: req.body.fecha_pago,
    estado: false,
    teletrans: req.body.teletrans,
    tipo: req.body.tipo,
    trabajador_dni: req.body.trabajador_dni,
  };

  try {
    const get = await ayuda_pago.findAll({
      where: { trabajador_dni: req.body.trabajador_dni },
      include: [{ model: pago }],
    });

    const filterExist = get.filter((item) => item.estado !== true);
    if (filterExist.length > 0) {
      return res.status(400).json({
        msg: "No se pudo registrar la programación de la ayuda, tiene un pago pendiente.",
        status: 400,
      });
    } else {
      if (parseInt(info.teletrans) % 4 !== 0) {
        return res.status(400).json({
          msg: "Error! La cantidad de teletrans debe ser equivalente a un volquete.",
          status: 400,
        });
      } else {
        const post = await pago.create(info);
        let contra_pago = {
          pago_id: post.id,
          trabajador_dni: req.body.trabajador_dni,
          teletrans: req.body.teletrans,
        };
        const pagoContrato = await ayuda_pago.create(contra_pago);

        return res
          .status(200)
          .json({ msg: "Programación registrada con éxito!", status: 200 });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo registrar.", status: 500 });
  }
};

const updateProgramacionAyuda = async (req, res, next) => {
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
      let updateContatoPago = await ayuda_pago.update(data, {
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

const deletePagoAyuda = async (req, res, next) => {
  let id = req.params.id;
  try {
    let delContratoPago = await ayuda_pago.destroy({
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
  getTrabajadorAyuda,
  createProgramacionAyuda,
  updateProgramacionAyuda,
  deletePagoAyuda
};
