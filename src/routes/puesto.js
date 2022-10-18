const router = require("express").Router();
const puesto = require("../controllers/puesto")



router.get("/", puesto.getPuesto)
// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router