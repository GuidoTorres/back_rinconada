const router = require("express").Router();
const saldo = require("../controllers/saldo")



router.get("/", saldo.getSaldo)
router.get("/:id", saldo.getSaldoById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router