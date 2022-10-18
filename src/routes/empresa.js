const router = require("express").Router();
const empresa = require("../controllers/empresa");

router.get("/", empresa.getEmpresa);
router.post("/", empresa.postEmpresa);
router.put("/:id", empresa.updateEmpresa);
router.delete("/:id", empresa.deleteEmpresa);
module.exports = router;
