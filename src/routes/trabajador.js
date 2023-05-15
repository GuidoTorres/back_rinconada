const express = require("express");
const trabajador = require("../controllers/trabajador");
const router = require("express").Router();
const images = require("../middleware/multerImage")
const multer = require("../middleware/multer")

router.get("/", trabajador.getTrabajador);
router.get("/aprobado", trabajador.getTrabajadorPagoAprobado);
router.get("/last/id", trabajador.getLastId);
router.post("/bulk",  multer(),trabajador.postMultipleTrabajador);
router.post("/",  images(),trabajador.postTrabajador);
router.put("/:id", images(),trabajador.updateTrabajador);
router.delete("/:id", trabajador.deleteTrabajador);
router.put("/softdelete/:id", trabajador.softDeleteTrabajador);
module.exports = router;
