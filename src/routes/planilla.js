const router = require("express").Router();
const planilla = require("../controllers/planilla");
const images = require("../middleware/multerImage")

router.get("/", planilla.getPlanilla);
router.get("/aprobacion", planilla.getPlanillaAprobacion);
router.get("/pagos", planilla.getPlanillaPago);
router.get("/pagos/lista", planilla.getListaPago);
router.get("/asociacion", planilla.getListaAsociacionProgramada);
router.get("/campamento", planilla.campamentoPlanilla);
router.get("/historial/:id", planilla.getPlanillaHistoriaTrabajador);
router.get("/tareo/:id", planilla.getTareoTrabajador);
router.get("/tareo/asociacion/:id", planilla.getTareoAsociacion);
router.get("/teletrans", planilla.juntarTeletrans);
router.put("/asociacion/:id", planilla.updatepagoAsociacion);
router.put("/asistencia/:id", planilla.updateTrabajadorAsistencia);
router.put("/huella/:id",images(), planilla.updateHuella);

// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router;
