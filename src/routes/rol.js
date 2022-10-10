const router = require("express").Router();
const rol = require("../controllers/rol")



router.get("/", rol.getRol)
router.get("/:id", rol.getRolById)
router.post("/", rol.postRol)
router.put("/:id", rol.updateRol)
router.delete("/:id", rol.deleteRol)
module.exports = router