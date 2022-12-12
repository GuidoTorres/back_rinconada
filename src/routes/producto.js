const router = require("express").Router();
const producto = require("../controllers/producto")



router.get("/", producto.getProducto)
router.get("/:id", producto.getProductoById)
router.post("/", producto.postProducto)
router.put("/:id", producto.updateProducto)
router.delete("/:id", producto.deleteProducto)
module.exports = router