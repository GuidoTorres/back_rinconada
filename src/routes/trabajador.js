const trabajador = require("../controllers/trabajador");
const router = require("express").Router();

router.get("/", trabajador.getTrabajador);
router.get("/:id", trabajador.getTrabajadorById);
router.post("/", trabajador.postTrabajador);
router.put("/:id", trabajador.updateTrabajador);
router.delete("/:id", trabajador.deleteTrabajador);
module.exports = router;
