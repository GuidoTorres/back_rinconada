const router = require("express").Router();
const asociacion = require("../controllers/asociacion");
const uploadFile = require("../middleware/multerAsociacion")

router.get("/", asociacion.getAsociacion);
router.post("/", asociacion.postAsociacion);
router.post("/upload/:id", uploadFile(), asociacion.uploadFile);
router.get("/:id", asociacion.getAsociacionById);
router.put("/:id", asociacion.updateAsociacion);
router.delete("/:id", asociacion.deleteAsociacion);
module.exports = router;
