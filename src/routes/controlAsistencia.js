const router = require("express").Router();
const control = require("../controllers/controlAsistencia")



router.get("/", control.actulizarFechaFin)

module.exports = router