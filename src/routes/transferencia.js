const router = require("express").Router();
const transferencia = require("../controllers/transferencia")



router.get("/", transferencia.getTransferencia)
// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router