const router = require("express").Router();
const almacen = require("../controllers/almacen")



router.get("/", almacen.getAlmacen)
router.get("/:id", almacen.getAlmacenById)
router.post("/", almacen.postAlmacen)
router.post("/transferencia", almacen.almacenTrasferencia)
router.put("/:id", almacen.updateAlmacen)
router.delete("/:id", almacen.deleteAlmacen)
router.get("/producto/:id", almacen.getProductsByAlmacen)
module.exports = router