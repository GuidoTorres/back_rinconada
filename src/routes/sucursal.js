const router = require("express").Router();
const sucursal = require("../controllers/sucursal");

router.get("/", sucursal.getsucursal);
router.post("/", sucursal.postSucursal);
router.put("/:id", sucursal.updateSucursal)
router.delete("/:id", sucursal.deleteSucursal)
module.exports = router;