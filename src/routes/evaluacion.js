const router = require("express").Router();
const evaluacion = require("../controllers/evaluacion")



router.get("/", evaluacion.getEvaluacion)
router.get("/:id", evaluacion.getEvaluacionById)
router.post("/", evaluacion.postEvaluacion)
router.put("/:id", evaluacion.updateEvaluacion)
router.delete("/:id", evaluacion.deleteEvaluacion)
module.exports = router