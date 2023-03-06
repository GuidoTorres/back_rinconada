const router = require("express").Router();
const trapiche = require("../controllers/trapiche")



router.get("/", trapiche.getTrapiche)
router.get("/:id", trapiche.getTrapicheById)
router.post("/", trapiche.postTrapiche)
router.put("/:id", trapiche.updateTrapiche)
router.delete("/:id", trapiche.deleteTrapiche)
module.exports = router