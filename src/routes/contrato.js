const router = require("express").Router();
const contrato = require("../controllers/contrato")



router.get("/", contrato.getContrato)
router.get("/last/:id", contrato.getLastId)
router.post("/", contrato.postContrato)
router.post("/asociacion", contrato.postContratoAsociacion);
router.get("/:id", contrato.getContratoById)
router.get("/asociacion/:id", contrato.getContratoAsociacionById)
router.put("/:id", contrato.updateContrato)
router.delete("/:id", contrato.deleteContrato)
module.exports = router