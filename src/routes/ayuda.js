const router = require("express").Router();
const ayuda = require("../controllers/ayudas");

router.get("/", ayuda.getTrabajadorAyuda)
router.post("/programacion", ayuda.createProgramacionAyuda);
// router.post("/pago", casa.postPagoCasa);
router.put("/programacion/:id", ayuda.updateProgramacionAyuda);
router.delete("/:id", ayuda.deletePagoAyuda)


module.exports = router;