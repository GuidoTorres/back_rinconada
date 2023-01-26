const router = require("express").Router();
const usuario = require("../controllers/usuario")

const getUsuario = usuario.getUsuario
const postUsuario = usuario.postUsuario
const updateUsuario = usuario.updateUsuario

router.get("/", getUsuario)
router.get("/:id", usuario.getUsuarioById)
router.get("/permiso/:id", usuario.getPermiso)
router.post("/", postUsuario)
router.put("/:id", updateUsuario)
router.put("/permisos/:id", usuario.updatePermisos)
router.delete("/:id", usuario.deleteUsuario)
module.exports = router