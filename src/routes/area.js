const router = require("express").Router();
const area = require("../controllers/area")



router.get("/", area.getArea)
router.get("/prueba", area.getPrueba)
// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router