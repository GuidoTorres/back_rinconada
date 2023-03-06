const router = require("express").Router();
const incentivo = require("../controllers/incentivo")


router.get("/", incentivo.getIncentivo)
router.get("/trabajadores", incentivo.getTrabajadoresIncentivo)
// router.post("/", incentivo.postIncentivo)
// router.post("/multiple", incentivo.postIncentivoMultiple)
// router.post("/multiple", pago.postMultiplePagos)
// router.post("/programacion", pago.createProgramacion)
// router.delete("/:id", incentivo.deleteIncentivo)

module.exports = router