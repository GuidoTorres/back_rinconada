const router = require("express").Router();
const socio = require("../controllers/socio")



router.get("/", socio.getSocio)
router.post("/", socio.postSocio)
router.put("/:id", socio.updateSocio)
router.delete("/:id", socio.deleteSocio)
module.exports = router