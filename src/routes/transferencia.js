const router = require("express").Router();
const transferencia = require("../controllers/transferencia")



router.get("/realizada/:id", transferencia.getTransferenciaRealizada)
router.get("/recibida/:id", transferencia.getTransferenciaRecibida)

router.post("/retornar/:id", transferencia.retornarTransferencia)
router.put("/:id", transferencia.updateTransferencia)
router.delete("/:id", transferencia.deleteTransferencia)
module.exports = router