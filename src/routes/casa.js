const router = require("express").Router();
const casa = require("../controllers/casa");

router.get("/", casa.getEmpresaPago)
router.post("/programacion", casa.createProgramacionCasa);
// router.post("/pago", casa.postPagoCasa);
router.post("/pago", casa.postMultiplePagos);
router.put("/programacion/:id", casa.updateProgramacionCasa);
router.delete("/:id", casa.deletePagoCasa)


// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
module.exports = router;
