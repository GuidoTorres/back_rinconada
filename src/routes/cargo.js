const router = require("express").Router();
const cargo = require("../controllers/cargo")



router.get("/",cargo.getCargo)
// router.get("/:id", rol.getRolById)
// router.post("/", rol.postRol)
// router.put("/:id", rol.updateRol)
// router.delete("/:id", rol.deleteRol)
module.exports = router