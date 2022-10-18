const { area } = require("../../config/db");

const getArea = async (req, res, next) => {
  try {
    const all = await area.findAll();
    res.status(200).json({data:all});
    next();
  } catch (error) {
    res.status(500).json();
  }
};

module.exports={getArea}