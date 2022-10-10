const router = require("express").Router();
const campamento = require("../controllers/campamento")


router.get("/", campamento.getCampamento)
router.get("/:id", campamento.getCampamentoById)
router.post("/", campamento.postCampamento)
router.put("/:id", campamento.updateCampamento)
router.delete("/:id", campamento.deleteCampamento)
module.exports = router