const router = require("express").Router();
const transferencia = require("../controllers/transferencia")



router.get("/realizada/:id", transferencia.getTransferenciaRealizada)
router.get("/recibida/:id", transferencia.getTransferenciaRecibida)
router.put("/:id", transferencia.updateTransferencia)
// router.delete("/:id", rol.deleteRol)
module.exports = router