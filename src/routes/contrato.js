const router = require("express").Router();
const contrato = require("../controllers/contrato")



router.get("/", contrato.getContrato)
router.get("/:id", contrato.getContratoById)
router.post("/", contrato.postContrato)
router.put("/:id", contrato.updateContrato)
router.delete("/:id", contrato.deleteContrato)
module.exports = router