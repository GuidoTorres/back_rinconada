const trabajador = require("../controllers/trabajador")
const router = require("express").Router();

const getTrabajador = trabajador.getTrabajador
const postTrabajador = trabajador.postTrabajador

router.get("/", getTrabajador)
router.post("/", postTrabajador)
module.exports = router