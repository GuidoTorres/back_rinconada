const router = require("express").Router();
const multer = require("../middleware/multerAsistencia")

const asistencia = require("../controllers/asistencia");



router.get("/", asistencia.getAsistencia)
router.get("/trabajador/:id", asistencia.getTrabajadorAsistencia)
router.post("/", asistencia.postAsistencia)
router.post("/excel", multer(), asistencia.getExcelAsistencia)
router.post("/trabajador", asistencia.postTrabajadorAsistencia)
// router.get("/:id", asistencia.getAsistenciaByCampamento)
router.get("/trabajador/:id/:asistencia", asistencia.getTrabajadorByCampamento)
router.put("/", asistencia.updateTrabajadorAsistencia)
router.put("/hora_ingreso/:id", asistencia.updateAsistencia)
router.delete("/:id", asistencia.deleteAsistencia)
module.exports = router