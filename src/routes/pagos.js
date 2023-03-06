const router = require("express").Router();
const pago = require("../controllers/pago")


router.get("/", pago.getPagoFecha)
router.get("/historial", pago.historialProgramacion)
router.post("/", pago.postPago)
router.post("/programacion", pago.createProgramacion)
router.post("/programacion/multiple", pago.createProgramacionMultiple)
router.post("/multiple", pago.postMultiplePagos)
router.put("/:id", pago.updateProgramacion)
router.put("/multiple/:id", pago.updateProgramacionMultiple)

router.delete("/:id", pago.deletePago)

module.exports = router