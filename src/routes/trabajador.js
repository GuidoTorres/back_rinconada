const express = require("express");
const trabajador = require("../controllers/trabajador");
const router = require("express").Router();
const images = require("../middleware/multerImage")

router.get("/", trabajador.getTrabajador);
router.get("/:id", trabajador.getTrabajadorById);
router.post("/",  images(),trabajador.postTrabajador, );
router.put("/:id", trabajador.updateTrabajador);
router.delete("/:id", trabajador.deleteTrabajador);
module.exports = router;
