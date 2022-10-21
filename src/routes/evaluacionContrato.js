const router = require("express").Router();
const evaluacion = require("../controllers/evaluacionContrato")



router.get("/", evaluacion.getEvaluacionContrato)
router.get("/:id", evaluacion.getContratoById)
router.get("/contratoevaluacion", evaluacion.getContratoEvaluacionById)




module.exports = router