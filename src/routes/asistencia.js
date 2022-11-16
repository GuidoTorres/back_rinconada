const router = require("express").Router();
const multer = require("../middleware/multer")

const asistencia = require("../controllers/asistencia");



router.get("/", asistencia.getAsistencia)
router.get("/trabajador", asistencia.getTrabajadorAsistencia)
router.post("/", asistencia.postAsistencia)
router.post("/excel", multer(), asistencia.getExcelAsistencia)
router.post("/trabajador", asistencia.postTrabajadorAsistencia)
// router.get("/:id", asistencia.getAsistenciaByCampamento)
router.get("/trabajador/:id/:asistencia", asistencia.getTrabajadorByCampamento)
router.put("/", asistencia.updateTrabajadorAsistencia)
router.delete("/:id", asistencia.deleteAsistencia)
module.exports = router