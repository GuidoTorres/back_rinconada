const router = require("express").Router();
const volquete = require("../controllers/volquete")



router.get("/", volquete.getVolquete)
router.get("/:id", volquete.getVolqueteById)
router.post("/", volquete.postVolquete)
router.put("/:id", volquete.updateVolquete)
router.delete("/:id", volquete.deleteVolquete)
module.exports = router