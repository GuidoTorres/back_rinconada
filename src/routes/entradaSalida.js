const router = require("express").Router();
const entrada = require("../controllers/entradaSalida")


router.get("/", entrada.getEntradaSalida)

router.get("/:id", entrada.getEntradaByAlmacen)
router.post("/", entrada.postEntradaSalida)
router.post("/estadistica", entrada.entradaSalidaEstadistica)
router.put("/:id", entrada.updateEntradaSalida)
router.delete("/:id", entrada.deleteEntradaSalida)
module.exports = router