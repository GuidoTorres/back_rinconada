const router = require("express").Router();
const categoria = require("../controllers/productoCategoria")



router.get("/",categoria.getCategoria)
router.post("/", categoria.postCategoria)
router.put("/:id", categoria.updateCategoria)
router.delete("/:id", categoria.deleteCategoria)
module.exports = router