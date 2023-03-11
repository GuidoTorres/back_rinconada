const router = require("express").Router();
const ayuda = require("../controllers/ayudas");

router.get("/", ayuda.getTrabajadorAyuda)
router.get("/lista", ayuda.getAyuda)
router.post("/pago", ayuda.postPagoExtraordinario);
// router.post("/pago", casa.postPagoCasa);
router.put("/programacion/:id", ayuda.updateProgramacionAyuda);
router.delete("/:id", ayuda.deletePagoAyuda)


module.exports = router;