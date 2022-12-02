const router = require("express").Router();
const proveedor = require("../controllers/proveedor");

router.get("/", proveedor.getProveedor);
router.post("/", proveedor.postProveedor);
router.put("/:id", proveedor.updateProveedor)
router.delete("/:id", proveedor.deleteProveedor)
module.exports = router;
