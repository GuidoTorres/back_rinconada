const router = require("express").Router();
const pago = require("../controllers/pago");

router.get("/", pago.getPagoFecha);
router.get("/historial", pago.historialProgramacion);
router.get("/validacion/:id", pago.validacionPago);
router.post("/", pago.postPago);
router.post("/asociacion", pago.asociacionPago);
router.post("/programacion", pago.createProgramacion);
router.post("/programacion/multiple", pago.createProgramacionMultiple);
router.post("/multiple", pago.postMultiplePagos);
router.post("/reprogramacion", pago.reprogramacionPago);
router.put("/:id", pago.updateProgramacion);
router.put("/multiple/:id", pago.updateProgramacionMultiple);
router.delete("/:id", pago.deletePago);
router.delete("/asociacion/:id", pago.deletePagoAsociacion);

module.exports = router;
