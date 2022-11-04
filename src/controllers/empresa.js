const { empresa, contrato } = require("../../config/db");

const getEmpresa = async (req, res, next) => {
  try {
    const all = await empresa.findAll({
      include: [{ model: contrato }],
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
    const all = await empresa.findByPk(
      id,
      {
        include: [{ model: contrato }],
      }
    );

    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
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
    res.status(200).json({ msg: "Empresa eliminado con exito" });
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
