const router = require("express").Router();
const unidad = require("../controllers/unidad")



router.get("/", unidad.getUnidad)
// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router