const router = require("express").Router();
const producto = require("../controllers/producto")
const multer = require("../middleware/multerImage")


router.get("/", producto.getProducto)
router.get("/:id", producto.getProductoById)
router.post("/", multer(), producto.postProducto)
router.put("/:id", multer(),producto.updateProducto)
router.delete("/:id", producto.deleteProducto)
module.exports = router