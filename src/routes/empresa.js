const router = require("express").Router();
const empresa = require("../controllers/empresa");

router.get("/", empresa.getEmpresa);
router.get("/:id", empresa.getEmpresaById);
router.post("/", empresa.postEmpresa);
router.put("/:id", empresa.updateEmpresa);
router.delete("/:id", empresa.deleteEmpresa);
module.exports = router;
