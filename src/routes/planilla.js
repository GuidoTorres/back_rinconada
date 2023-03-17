const router = require("express").Router();
const planilla = require("../controllers/planilla");

router.get("/", planilla.getPlanilla);
router.get("/pagos", planilla.getPlanillaPago);
router.get("/pagos/lista", planilla.getListaPago);
router.get("/asociacion", planilla.getListaAsociacionProgramada);
router.get("/campamento", planilla.campamentoPlanilla);
router.get("/tareo/:id", planilla.getTareoTrabajador);
router.get("/tareo/asociacion/:id", planilla.getTareoAsociacion);
router.get("/teletrans", planilla.juntarTeletrans);
router.put("/asociacion/:id", planilla.updatepagoAsociacion)
// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router;
