const router = require("express").Router();
const entrada = require("../controllers/entradaSalida")


router.get("/", entrada.getEntradaSalida)
router.get("/:id", entrada.getEntradaByAlmacen)
router.post("/", entrada.postEntrada)
router.post("/salida", entrada.postSalida)
router.post("/estadistica", entrada.entradaSalidaEstadistica)
router.post("/eliminar/:id", entrada.deleteEntradaSalida)
router.put("/:id", entrada.updateEntradaSalida)
module.exports = router