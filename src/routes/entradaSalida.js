const router = require("express").Router();
const entradaSalida = require("../controllers/entradaSalida")



router.get("/", entradaSalida.getEntradaByAlmacen)
router.get("/:id", almacen.getAlmacenById)
router.post("/", almacen.postAlmacen)
router.put("/:id", almacen.updateAlmacen)
router.delete("/:id", almacen.deleteAlmacen)
router.get("/producto/:id", almacen.getProductsByAlmacen)
module.exports = router