const router = require("express").Router();
const usuario = require("../controllers/usuario")
const images = require("../middleware/multerImage")

const getUsuario = usuario.getUsuario
const postUsuario = usuario.postUsuario
const updateUsuario = usuario.updateUsuario

router.get("/", getUsuario)
router.get("/:id", usuario.getUsuarioById)
router.get("/permiso/:id", usuario.getPermiso)
router.post("/", images(),postUsuario)
router.put("/:id", images(),updateUsuario)
router.put("/permisos/:id", usuario.updatePermisos)
router.delete("/:id", usuario.deleteUsuario)
module.exports = router