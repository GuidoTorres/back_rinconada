const router = require("express").Router();
const planilla = require("../controllers/planilla")



router.get("/", planilla.getPlanilla)
router.get("/campamento", planilla.campamentoPlanilla)
router.get("/tareo/:id", planilla.getTareoTrabajador)
// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router