const router = require("express").Router();
const aprobacion = require("../controllers/aprobacion")



router.get("/", aprobacion.getAprobacion)
// router.get("/:id", almacen.getAlmacenById)
// router.post("/", almacen.postAlmacen)
// router.post("/transferencia", almacen.almacenTrasferencia)
// router.put("/:id", almacen.updateAlmacen)
// router.delete("/:id", almacen.deleteAlmacen)
// router.get("/producto/:id", almacen.getProductsByAlmacen)
module.exports = router