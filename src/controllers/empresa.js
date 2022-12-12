const { empresa, contrato } = require("../../config/db");

const getEmpresa = async (req, res, next) => {
  try {
    const all = await empresa.findAll({
      include: [{ model: contrato, attributes: { exclude: ["contrato_id"] } }],
    });
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getEmpresaById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const all = await empresa.findAll({
      where: { id: id },
      include: [{ model: contrato, attributes: { exclude: ["contrato_id"] } }],
    });
    const filterContrato = all?.filter((item) => item.contratos.length !== 0);
    res.status(200).json({ data: filterContrato });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

const postEmpresa = async (req, res, next) => {
  let info = {
    razon_social: req.body.razon_social,
    ruc: req.body.ruc,
  };

  try {
    const empre = await empresa.create(info);
    res.status(200).json({ data: empre });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateEmpresa = async (req, res, next) => {
  let id = req.params.id;

  try {
    let camp = await empresa.update(req.body, { where: { id: id } });
    res.status(200).json({ msg: "Empresa actualizado con exito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteEmpresa = async (req, res, next) => {
  let id = req.params.id;
  try {
    let camp = await empresa.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Empresa eliminada con exito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getEmpresa,
  postEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getEmpresaById,
};
