const { cargo, area } = require("../../config/db");

const getCargo = async (req, res, next) => {
  try {
    const all = await cargo.findAll({
      include: [{ model: area }],
      attributes: { exclude: ["cargo_id"] },
    });
    return res.status(200).json({ data: all });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

module.exports = { getCargo };
