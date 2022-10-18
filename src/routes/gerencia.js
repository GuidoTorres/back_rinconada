const router = require("express").Router();
const gerencia = require("../controllers/gerencia")



router.get("/", gerencia.getGerencia)
// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router