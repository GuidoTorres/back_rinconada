const router = require("express").Router();
const requerimiento = require("../controllers/requerimiento");

router.get("/", requerimiento.getRequerimiento);
router.get("/last/id", requerimiento.getLastId);
router.get("/:id", requerimiento.getRequerimientoById);

router.post("/", requerimiento.postARequerimiento);
router.put("/producto/:id", requerimiento.updateRequerimientoProducto);
router.put("/:id", requerimiento.updateRequerimiento);
router.delete("/:id", requerimiento.deleteRequerimiento);
module.exports = router;
