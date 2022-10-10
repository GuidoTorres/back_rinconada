const { campamento } = require("../../config/db");

const getCampamento = async (req, res, next) => {
  try {
    const all = await campamento.findAll();
    res.status(200).json({data:all});
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getCampamentoById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const camp = await campamento.findAll({ where: { id: id } });
    res.status(200).json({data:camp});

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postCampamento = async (req, res, next) => {
  let info = {
    nombre: req.body.nombre,
    direccion: req.body.direccion,
  };

  try {
    const camp = await campamento.create(info);
    res.status(200).json({data:camp});

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateCampamento = async (req, res, next) => {
  let id = req.params.id;

  try {
    let camp = await campamento.update(req.body, { where: { id: id } });
    res.status(200).json({ msg: "Campamento actualizado con exito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteCampamento = async (req, res, next) => {
  let id = req.params.id;
  try {
    let camp = await campamento.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Campamento eliminado con exito" });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getCampamento,
  getCampamentoById,
  postCampamento,
  updateCampamento,
  deleteCampamento,
};
