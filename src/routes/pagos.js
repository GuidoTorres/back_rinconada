const router = require("express").Router();
const pago = require("../controllers/pago")



router.post("/", pago.postPago)
router.post("/multiple", pago.postMultiplePagos)

// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router