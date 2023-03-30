const { usuario, rol, permisos, cargo } = require("../../config/db");
const { tokenSign } = require("../helpers/generateToken");
const { compare } = require("../helpers/handleBcrypt");

const authLogin = async (req, res, next) => {
  try {
    const { user, contrasenia } = req.body;
    const get = await usuario.findOne({
      where: { usuario: user },
      include: [{ model: rol, include: [{ model: permisos }] }],
    });

    if (!get) {
      return res
        .status(404)
        .send({ msg: "Usuario no encontrado!", status: 404 });
    }

    const checkPassword = await compare(contrasenia, get.contrasenia);
    const tokenSession = await tokenSign(get);
    if (get.estado === false) {
      return res.status(500).send({ msg: "Usuario inactivo!", status: 500 });
    }

    if (checkPassword) {
      return res.send({
        data: get,
        tokenSession,
        msg: `Bienvenido ${get.nombre}!`,
        status: 200,
      });
    }

    if (!checkPassword) {
      return res
        .status(409)
        .send({ msg: "Contraseña incorrecta!", status: 409 });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Hubo un error.", status: 500 });
  }
};

module.exports = authLogin;
