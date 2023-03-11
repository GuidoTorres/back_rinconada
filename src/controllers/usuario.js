const { usuario, permisos } = require("../../config/db");
const { encrypt } = require("../helpers/handleBcrypt");
const fs = require("fs");

const getUsuario = async (req, res, next) => {
  try {
    const all = await usuario.findAll();
    res.status(200).json({ data: all });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getUsuarioById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const user = await usuario.findAll({ where: { id: id } });
    res.status(200).json({ data: user });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postUsuario = async (req, res, next) => {
  const { contrasenia } = req.body;
  const passwordHash = await encrypt(contrasenia);

  let info = {
    nombre: req.body.nombre,
    usuario: req.body.usuario,
    contrasenia: passwordHash,
    estado: req.body.estado,
    rol_id: req.body.rol_id,
    cargo_id: req.body.cargo_id,
    foto: req.file ? process.env.LOCAL_IMAGE + req?.file?.filename : "",
  };

  try {
    const getUser = await usuario.findAll({
      where: { usuario: info.usuario },
    });

    if (getUser.length > 0) {
      res.status(200).json({
        msg: "El nombre de usuario ya existe, intente con otro!",
        status: 500,
      });
    } else {
      const nuevoUsuario = await usuario.create(info);
      res.status(200).json({
        data: nuevoUsuario,
        msg: "Usuario creado con éxito!",
        status: 200,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo crear!", status: 500 });
  }
};

const updateUsuario = async (req, res, next) => {
  let id = req.params.id;

  let info = {
    nombre: req.body.nombre,
    usuario: req.body.usuario,
    estado: req.body.estado,
    rol_id: req.body.rol_id,
    cargo_id: req.body.cargo_id,
    foto: req.file
      ? process.env.LOCAL_IMAGE + req.file.filename
      : req.body.foto,
  };


  try {
    console.log(req.body.foto);
    if (req?.body?.foto !== undefined && req.body.foto !== "") {
      const fileDir = require("path").resolve(__dirname, `./public/images/`);

      const editFotoLink = req.body.foto.split("/").at(-1);
      fs.unlink("./public/images/" + editFotoLink, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("eliminado con éxito!");
        }
      });
    }
    let user = await usuario.update(info, { where: { id: id } });
    res
      .status(200)
      .json({ msg: "Usuario actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar", status: 500 });
  }
};

const deleteUsuario = async (req, res, next) => {
  let id = req.params.id;
  try {
    let user = await usuario.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Usuario eliminado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar", status: 500 });
  }
};

const getPermiso = async (req, res, next) => {
  let id = req.params.id;

  try {
    const user = await permisos.findAll({
      where: { rol_id: id },
      attributes: { exclude: ["usuario_id"] },
    });
    res.status(200).json({ data: user });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const updatePermisos = async (req, res, next) => {
  let id = req.params.id;

  let info = {
    administracion: req?.body?.administracion,
    administracion_usuario: req?.body?.administracion_usuario,
    administracion_campamento: req?.body?.administracion_campamento,
    administracion_rol: req?.body?.administracion_rol,
    personal: req?.body?.personal,
    personal_trabajador: req?.body?.personal_trabajador,
    personal_grupal: req?.body?.personal_grupal,
    personal_empresa: req?.body?.personal_empresa,
    personal_socio: req?.body?.personal_socio,
    planillas: req?.body?.planillas,
    planillas_asistencia: req?.body?.planillas_asistencia,
    planillas_control: req?.body?.planillas_control,
    logistica: req?.body?.logistica,
    logistica_inventario: req?.body?.logistica_inventario,
    logistica_almacen: req?.body?.logistica_almacen,
    logistica_requerimiento: req?.body?.logistica_requerimiento,
    logistica_aprobacion: req?.body?.logistica_aprobacion,
    logistica_transferencia: req?.body?.logistica_transferencia,
    logistica_categoria: req?.body?.logistica_categoria,
    logistica_estadistica: req?.body?.logistica_estadistica,
    finanzas: req?.body?.finanzas,
    finanzas_ingreso: req?.body?.finanzas_ingreso,
    finanzas_proveedor: req?.body?.finanzas_proveedor,
    finanzas_sucursal: req?.body?.finanzas_sucursal,
    personal_contrato: req?.body?.personal_contrato,
    personal_evaluacion: req?.body?.personal_evaluacion,
  };
  try {
    let user = await permisos.update(info, { where: { rol_id: id } });
    res
      .status(200)
      .json({ msg: "Permisos actualizados con éxito!", status: 200 });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

module.exports = {
  postUsuario,
  getUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuarioById,
  updatePermisos,
  getPermiso,
};
