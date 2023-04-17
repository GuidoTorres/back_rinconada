const { campamento } = require("../../config/db");

const getCampamento = async (req, res, next) => {
  try {
    const all = await campamento.findAll({attributes: { exclude: ["campamento_id"] },});
    return res.status(200).json({ data: all });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getCampamentoById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const camp = await campamento.findAll({ where: { id: id } });
    return res.status(200).json({ data: camp });

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
    return res.status(200).json({ msg:"Campamento creado con éxito!", status: 200});

    next();
  } catch (error) {
    res.status(500).json({ msg:"No se pudo crear.", status: 500});
  }
};

const updateCampamento = async (req, res, next) => {
  let id = req.params.id;

  try {
    let camp = await campamento.update(req.body, { where: { id: id } });
    return res.status(200).json({ msg: "Campamento actualizado con éxito", status:200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar.", status:500 });
  }
};

const deleteCampamento = async (req, res, next) => {
  let id = req.params.id;
  try {
    let camp = await campamento.destroy({ where: { id: id } });
    return res.status(200).json({ msg: "Campamento eliminado con éxito!", status:200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status:500 });
  }
};

module.exports = {
  getCampamento,
  getCampamentoById,
  postCampamento,
  updateCampamento,
  deleteCampamento,
};
