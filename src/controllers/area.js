const { area, gerencia } = require("../../config/db");

const getArea = async (req, res, next) => {
  try {
    const all = await area.findAll({include:[{model: gerencia}]});
    return res.status(200).json({ data: all });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

module.exports = { getArea };
