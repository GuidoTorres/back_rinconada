const express = require("express");
const trabajador = require("../controllers/trabajador");
const router = require("express").Router();
const images = require("../middleware/multerImage")
const multer = require("../middleware/multer")

router.get("/", trabajador.getTrabajador);
router.get("/:id", trabajador.getTrabajadorById);
router.post("/bulk",  multer(),trabajador.postMultipleTrabajador);
router.post("/",  images.uploadFile(),trabajador.postTrabajador);
router.put("/:id", images.uploadFile(),trabajador.updateTrabajador);
router.delete("/:id", trabajador.deleteTrabajador);
module.exports = router;
